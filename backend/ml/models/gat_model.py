import torch
import torch.nn.functional as F
from torch_geometric.nn import GATConv

class SocialGAT(torch.nn.Module):
    def __init__(self, in_channels, out_channels=128):
        super(SocialGAT, self).__init__()
        # This layer looks at the neighbors and "pays attention" to the important ones
        self.conv1 = GATConv(in_channels, 64, heads=2)
        self.conv2 = GATConv(64 * 2, out_channels, heads=1)

    def forward(self, x, edge_index):
        # x = node features (e.g., trust scores)
        # edge_index = the map of who is connected to whom
        x = self.conv1(x, edge_index)
        x = F.elu(x)
        x = self.conv2(x, edge_index)
        return x

# Simple Test
if __name__ == "__main__":
    # Create dummy data: 3 people, each with 16 features (like trust score)
    x = torch.randn(3, 16) 
    # Create connections: Person 0 -> 1, 1 -> 2
    edge_index = torch.tensor([[0, 1, 1, 2], [1, 0, 2, 1]], dtype=torch.long)
    
    model = SocialGAT(in_channels=16)
    output = model(x, edge_index)
    
    print("GAT Output Shape:", output.shape) # Should be [3, 128]