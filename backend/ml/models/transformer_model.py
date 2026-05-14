import torch
import torch.nn as nn

class BehavioralTransformer(nn.Module):
    def __init__(self, input_dim=4, d_model=64, nhead=4, num_layers=2):
        super(BehavioralTransformer, self).__init__()
        
        # 1. Input Embedding: Turns our raw numbers into a 'vector' (a list of numbers)
        self.embedding = nn.Linear(input_dim, d_model)
        
        # 2. The 'Brain': The Transformer Encoder layer
        # This looks at the sequence of 12 months and figures out the patterns
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # 3. Output Layer: Shrinks it down to a 128-dim embedding as we planned
        self.fc = nn.Linear(d_model, 128)

    def forward(self, x):
        # x shape: (batch_size, 12, input_dim) -> 12 months of data
        x = self.embedding(x)
        x = self.transformer(x)
        
        # We take the last "month" or use pooling to get the summary
        x = x.mean(dim=1) 
        x = self.fc(x)
        return x

# Simple Test
if __name__ == "__main__":
    # Create dummy data: 5 people, 12 months, 4 features per month
    dummy_input = torch.randn(5, 12, 4) 
    model = BehavioralTransformer()
    output = model(dummy_input)
    print("Transformer Output Shape:", output.shape) # Should be [5, 128]