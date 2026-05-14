import pandas as pd
import numpy as np
import json
import os

def extract_sequence_features(monthly_seq_str):
    """Extract aggregate features from 12-month sequence"""
    months = json.loads(monthly_seq_str)
    recharge_amounts    = [m["recharge_amount"]   for m in months]
    electricity_paid    = [m["electricity_paid"]  for m in months]
    grocery_spends      = [m["grocery_spend"]     for m in months]
    recharge_freq       = [m["recharge_frequency"] for m in months]
    return {
        "avg_recharge":          np.mean(recharge_amounts),
        "recharge_stability":    1 - (np.std(recharge_amounts) /
                                      (np.mean(recharge_amounts) + 1e-6)),
        "electricity_regularity": np.mean(electricity_paid),
        "avg_grocery":           np.mean(grocery_spends),
        "grocery_stability":     1 - (np.std(grocery_spends) /
                                      (np.mean(grocery_spends) + 1e-6)),
        "avg_recharge_freq":     np.mean(recharge_freq),
        # trend: is spending going up or down over last 3 vs first 3 months?
        "recharge_trend":        np.mean(recharge_amounts[-3:]) -
                                 np.mean(recharge_amounts[:3]),
    }

def extract_graph_features(social_refs_str):
    """Extract aggregate features from social references"""
    refs = json.loads(social_refs_str)
    trust_scores = [r["trust_score"] for r in refs]
    rel_weights  = {"guarantor": 1.0, "employer": 0.8, "neighbor": 0.5}
    weighted     = [r["trust_score"] * rel_weights.get(r["relationship_type"], 0.3)
                    for r in refs]
    return {
        "avg_trust_score":      np.mean(trust_scores),
        "max_trust_score":      np.max(trust_scores),
        "num_references":       len(refs),
        "weighted_trust":       np.mean(weighted),
        "has_guarantor":        int(any(r["relationship_type"] == "guarantor"
                                        for r in refs)),
    }

def process_data():
    input_path = os.path.join(os.path.dirname(__file__), '../data/applicants.csv')
    df = pd.read_csv(input_path)
    print(f"Processing {len(df)} records...")

    seq_features   = df["monthly_sequence"].apply(extract_sequence_features)
    graph_features = df["social_references"].apply(extract_graph_features)

    seq_df   = pd.DataFrame(seq_features.tolist())
    graph_df = pd.DataFrame(graph_features.tolist())
    df       = pd.concat([df, seq_df, graph_df], axis=1)

    # normalize key columns
    for col in ["avg_recharge", "avg_grocery", "recharge_trend"]:
        df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min() + 1e-6)

    out = os.path.join(os.path.dirname(__file__), '../data/processed_applicants.csv')
    df.to_csv(out, index=False)
    print(f"Done. Label distribution:\n{df['label'].value_counts()}")

if __name__ == "__main__":
    process_data()