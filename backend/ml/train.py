import pandas as pd
import numpy as np
import json
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch_geometric.data import Data, Batch
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, f1_score
import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from backend.ml.models.transformer_model import BehavioralTransformer
from backend.ml.models.gat_model import SocialGAT
from backend.ml.models.fusion_model import FusionModel

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on: {DEVICE}")

class LoanDataset(Dataset):
    def __init__(self, df):
        self.df = df.reset_index(drop=True)

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]

        # Behavioral sequence tensor (12, 4)
        months = json.loads(row["monthly_sequence"])
        seq = []
        for m in months:
            seq.append([
                m["recharge_amount"]    / 1000.0,
                m["recharge_frequency"] / 4.0,
                float(m["electricity_paid"]),
                m["grocery_spend"]      / 10000.0,
            ])
        behavior_tensor = torch.tensor(seq, dtype=torch.float32)

        # Social graph tensors
        refs = json.loads(row["social_references"])
        n    = len(refs) + 1
        node_feats = torch.zeros(n, 16)
        node_feats[0, 0] = row["location_stability"] / 100.0
        node_feats[0, 1] = row["months_at_address"]  / 120.0
        rel_map = {"guarantor": 1.0, "employer": 0.8, "neighbor": 0.5}
        for i, r in enumerate(refs):
            node_feats[i+1, 0] = r["trust_score"]
            node_feats[i+1, 1] = rel_map.get(r["relationship_type"], 0.3)

        src        = list(range(1, n)) + [0] * len(refs)
        dst        = [0] * len(refs) + list(range(1, n))
        edge_index = torch.tensor([src, dst], dtype=torch.long)

        label = torch.tensor([row["label"]], dtype=torch.float32)
        return behavior_tensor, node_feats, edge_index, label


def collate_fn(batch):
    behaviors, node_feats_list, edge_indexes, labels = zip(*batch)
    behavior_batch  = torch.stack(behaviors)
    label_batch     = torch.cat(labels)
    graph_data_list = [
        Data(x=nf, edge_index=ei)
        for nf, ei in zip(node_feats_list, edge_indexes)
    ]
    graph_batch = Batch.from_data_list(graph_data_list)
    return behavior_batch, graph_batch, label_batch


def train():
    df = pd.read_csv("backend/ml/data/applicants.csv")
    train_df, val_df = train_test_split(
        df, test_size=0.2, stratify=df["label"], random_state=42
    )
    print(f"Train: {len(train_df)} | Val: {len(val_df)}")

    train_loader = DataLoader(
        LoanDataset(train_df), batch_size=32,
        shuffle=True,  collate_fn=collate_fn
    )
    val_loader = DataLoader(
        LoanDataset(val_df), batch_size=32,
        shuffle=False, collate_fn=collate_fn
    )

    b_model = BehavioralTransformer().to(DEVICE)
    g_model = SocialGAT(in_channels=16).to(DEVICE)
    f_model = FusionModel().to(DEVICE)

    params = (
        list(b_model.parameters()) +
        list(g_model.parameters()) +
        list(f_model.parameters())
    )
    optimizer = torch.optim.Adam(params, lr=1e-3, weight_decay=1e-4)
    criterion = nn.BCELoss()
    scheduler = torch.optim.lr_scheduler.StepLR(
        optimizer, step_size=5, gamma=0.5
    )

    best_auc = 0.0
    os.makedirs("backend/ml/saved_models", exist_ok=True)

    for epoch in range(20):

        # ── Training ──────────────────────────────────────────────
        b_model.train()
        g_model.train()
        f_model.train()
        total_loss = 0

        for behavior, graph_batch, labels in train_loader:
            behavior    = behavior.to(DEVICE)
            labels      = labels.to(DEVICE)
            graph_batch = graph_batch.to(DEVICE)

            b_emb = b_model(behavior)                           # (B, 128)
            g_out = g_model(graph_batch.x, graph_batch.edge_index)

            # pool per graph — take applicant node (node 0 per graph)
            g_emb = torch.zeros(behavior.size(0), 128).to(DEVICE)
            for i, ptr in enumerate(graph_batch.ptr[:-1]):
                g_emb[i] = g_out[ptr]

            # FusionModel now returns 0.0-1.0 directly
            score = f_model(b_emb, g_emb).squeeze()            # (B,)
            loss  = criterion(score, labels)

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(params, 1.0)
            optimizer.step()
            total_loss += loss.item()

        # ── Validation ────────────────────────────────────────────
        b_model.eval()
        g_model.eval()
        f_model.eval()
        all_scores, all_labels = [], []

        with torch.no_grad():
            for behavior, graph_batch, labels in val_loader:
                behavior    = behavior.to(DEVICE)
                graph_batch = graph_batch.to(DEVICE)

                b_emb = b_model(behavior)
                g_out = g_model(graph_batch.x, graph_batch.edge_index)
                g_emb = torch.zeros(behavior.size(0), 128).to(DEVICE)
                for i, ptr in enumerate(graph_batch.ptr[:-1]):
                    g_emb[i] = g_out[ptr]

                # scores are already 0.0-1.0
                scores = f_model(b_emb, g_emb).squeeze()
                all_scores.extend(scores.cpu().numpy())
                all_labels.extend(labels.numpy())

        auc      = roc_auc_score(all_labels, all_scores)
        preds    = [1 if s >= 0.5 else 0 for s in all_scores]
        f1       = f1_score(all_labels, preds)
        avg_loss = total_loss / len(train_loader)

        print(f"Epoch {epoch+1:02d} | Loss: {avg_loss:.4f} | "
              f"AUC: {auc:.4f} | F1: {f1:.4f}")
        scheduler.step()

        if auc > best_auc:
            best_auc = auc
            torch.save(b_model.state_dict(),
                       "backend/ml/saved_models/transformer.pth")
            torch.save(g_model.state_dict(),
                       "backend/ml/saved_models/gat.pth")
            torch.save(f_model.state_dict(),
                       "backend/ml/saved_models/fusion.pth")
            print(f"  -> Best model saved (AUC: {best_auc:.4f})")

    print(f"\nTraining complete. Best AUC: {best_auc:.4f}")


if __name__ == "__main__":
    train()