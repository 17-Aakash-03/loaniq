import torch
import torch.nn as nn

class FusionModel(nn.Module):
    def __init__(self):
        super(FusionModel, self).__init__()

        self.fc1     = nn.Linear(256, 128)
        self.fc2     = nn.Linear(128, 64)
        self.fc3     = nn.Linear(64, 32)
        self.output  = nn.Linear(32, 1)

        self.dropout = nn.Dropout(0.3)
        self.bn1     = nn.BatchNorm1d(128)
        self.bn2     = nn.BatchNorm1d(64)

        # temperature > 1 flattens sigmoid, preventing saturation at 0 or 1
        self.temperature = nn.Parameter(torch.tensor(2.5))

    def forward(self, behavior_emb, graph_emb):
        combined = torch.cat((behavior_emb, graph_emb), dim=1)

        x = torch.relu(self.bn1(self.fc1(combined)))
        x = self.dropout(x)
        x = torch.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        x = torch.relu(self.fc3(x))

        logit = self.output(x)
        # divide by temperature before sigmoid — keeps output away from 0/1 extremes
        score = torch.sigmoid(logit / self.temperature)
        return score  # 0.0 to 1.0

if __name__ == "__main__":
    behavioral_data = torch.randn(1, 128)
    social_data     = torch.randn(1, 128)
    model           = FusionModel()
    model.eval()
    with torch.no_grad():
        score = model(behavioral_data, social_data)
    print(f"Score (0-1):   {score.item():.4f}")
    print(f"Score (0-100): {round(score.item() * 100)}")