import shap
import torch
import numpy as np

# We assume our model is simple enough to use the KernelExplainer
def explain_loan_score(model, behavior_data, graph_data):
    # This function creates a dummy 'background' for SHAP to compare against
    # We use our model's forward method to generate the explanation
    def model_wrapper(data):
        # We need to split the data back into behavior and graph parts for the model
        b = torch.tensor(data[:, :128], dtype=torch.float32)
        g = torch.tensor(data[:, 128:], dtype=torch.float32)
        return model(b, g).detach().numpy()

    # Create a simple explainer
    # We use a small subset of data as 'reference'
    reference = np.random.randn(10, 256) 
    explainer = shap.KernelExplainer(model_wrapper, reference)
    
    # Explain one specific applicant (concatenated inputs)
    applicant_input = np.concatenate([behavior_data.detach().numpy(), graph_data.detach().numpy()], axis=1)
    shap_values = explainer.shap_values(applicant_input)
    
    return shap_values

# Narrator Engine (Plain English)
def generate_narrative(shap_values):
    # Just a dummy mapping for now
    if shap_values[0][0] > 0:
        return "Your payment consistency is the primary reason for this score."
    else:
        return "Your social trust graph is currently limiting your loan eligibility."

# Test
if __name__ == "__main__":
    # Simulate a result from our fusion model
    fake_behavior = torch.randn(1, 128)
    fake_graph = torch.randn(1, 128)
    
    # We will hook this to your fusion model in the next week
    print("Explanation Engine Ready.")