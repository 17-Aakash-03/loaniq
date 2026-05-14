import pandas as pd
import numpy as np
from faker import Faker
import random
import json
import os

fake = Faker('en_IN')
random.seed(42)
np.random.seed(42)

def generate_monthly_sequence(base_recharge, base_elec, base_grocery, consistency):
    """Generate 12 months of behavioral data with realistic variation"""
    months = []
    for _ in range(12):
        noise = random.uniform(1 - (1 - consistency), 1 + (1 - consistency))
        months.append({
            "recharge_amount": round(max(0, base_recharge * noise)),
            "recharge_frequency": random.randint(1, 4),
            "electricity_paid": 1 if random.random() < consistency else 0,
            "grocery_spend": round(max(0, base_grocery * noise))
        })
    return months

def generate_social_references(trust_level):
    """Generate 2-4 social references with realistic trust scores"""
    n_refs = random.randint(2, 4)
    refs = []
    rel_types = ["guarantor", "employer", "neighbor"]
    for _ in range(n_refs):
        refs.append({
            "relationship_type": random.choice(rel_types),
            "trust_score": round(random.uniform(
                trust_level - 0.2, min(1.0, trust_level + 0.2)
            ), 2)
        })
    return refs

def compute_label(consistency, social_trust, location_stability, months_at_address):
    """Realistic label with multiple factors and noise"""
    score = (
        consistency * 0.35 +
        social_trust * 0.30 +
        (location_stability / 100) * 0.20 +
        min(months_at_address / 60, 1.0) * 0.15
    )
    # add noise so boundary cases vary
    score += random.uniform(-0.08, 0.08)
    return 1 if score >= 0.55 else 0

def generate_data(num_samples=10000):
    records = []
    print(f"Generating {num_samples} applicant records...")

    for i in range(num_samples):
        consistency   = round(random.uniform(0.3, 1.0), 2)
        social_trust  = round(random.uniform(0.0, 1.0), 2)
        loc_stability = random.randint(10, 100)
        months_addr   = random.randint(1, 120)
        base_recharge = random.randint(100, 1000)
        base_elec     = random.randint(300, 3000)
        base_grocery  = random.randint(1000, 10000)

        monthly_seq  = generate_monthly_sequence(
            base_recharge, base_elec, base_grocery, consistency
        )
        social_refs  = generate_social_references(social_trust)
        label        = compute_label(
            consistency, social_trust, loc_stability, months_addr
        )

        records.append({
            "applicant_id":       i + 1,
            "name":               fake.name(),
            "consistency":        consistency,
            "social_trust":       social_trust,
            "location_stability": loc_stability,
            "months_at_address":  months_addr,
            "monthly_sequence":   json.dumps(monthly_seq),
            "social_references":  json.dumps(social_refs),
            "label":              label
        })

    df = pd.DataFrame(records)
    out = os.path.join(os.path.dirname(__file__), 'applicants.csv')
    df.to_csv(out, index=False)

    approved = df['label'].sum()
    print(f"Saved {num_samples} records. Approved: {approved} "
          f"({100*approved/num_samples:.1f}%) | "
          f"Rejected: {num_samples-approved} "
          f"({100*(num_samples-approved)/num_samples:.1f}%)")

if __name__ == "__main__":
    generate_data()