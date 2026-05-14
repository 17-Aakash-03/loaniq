# LoanIQ — AI Credit Scoring for Unbanked Populations

> Alternative credit scoring system using behavioral and social graph data for unbanked individuals in India

![Python](https://img.shields.io/badge/Python-3.12-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0-red)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)
![AUC](https://img.shields.io/badge/AUC--ROC-0.9618-brightgreen)

## 🧠 Overview

LoanIQ uses a **Transformer + Graph Attention Network (GAT)** neural network to score loan applicants using alternative data — mobile recharge patterns, grocery spending, electricity bill regularity, location stability, and social trust networks — instead of traditional CIBIL scores.

Built for unbanked populations in India who lack formal credit history.

## ✨ Features

- **AI Credit Scoring** — Transformer + GAT neural network (AUC-ROC: 0.9618, F1: 0.9142)
- **SHAP Explainability** — Real-time feature impact analysis with waterfall charts
- **PDF Reports** — Professional downloadable credit reports
- **Email Notifications** — Automated score delivery via Gmail
- **Batch CSV Scoring** — Score multiple applicants at once
- **Admin Dashboard** — User management and analytics
- **EDA Console** — Exploratory data analysis visualization
- **Model Comparison** — Benchmark against 5 baseline models
- **Loan Calculator** — EMI calculation based on credit score
- **What-If Simulator** — Predict score changes with feature adjustments
- **30-Day Prediction** — Score trend forecasting
- **Peer Comparison** — Percentile ranking against all applicants
- **Dark/Light Mode** — Full theme support
- **Hindi/English Toggle** — Bilingual interface
- **Mobile Responsive** — Works on all screen sizes

## 🏗️ Architecture
Behavioral Data (12 months) → Transformer Encoder → 128-dim embedding
↓
Social Graph Data           → Graph Attention Network → 128-dim embedding
↓
Fusion Layer → Score 0-100

## 🛠️ Tech Stack

### Backend
- **FastAPI** — REST API
- **PyTorch** — Deep learning (Transformer + GAT)
- **SQLite** — Database
- **JWT** — Authentication
- **SHAP** — Explainability
- **smtplib** — Email notifications

### Frontend
- **React 18** — UI framework
- **Recharts** — Data visualization
- **jsPDF** — PDF generation
- **canvas-confetti** — Celebrations
- **Tailwind CSS** — Styling

## 📊 Model Performance

| Metric    | Score  |
|-----------|--------|
| AUC-ROC   | 0.9618 |
| F1 Score  | 0.9142 |
| Precision | 0.9280 |
| Recall    | 0.9010 |
| Accuracy  | 0.9200 |

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm 9+

### Backend Setup
```bash
cd "Micro-Loan Worthiness System"
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
npx serve -s build -l 3000
```

### Environment Variables
Create `.env` in root directory:

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
SECRET_KEY=your_secret_key

## 📁 Project Structure

loaniq/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI endpoints
│   │   ├── core/
│   │   │   ├── auth.py      # JWT authentication
│   │   │   ├── database.py  # SQLAlchemy models
│   │   │   └── email.py     # Email notifications
│   │   └── schemas/
│   │       └── schemas.py   # Pydantic schemas
│   └── ml/
│       ├── models/
│       │   ├── transformer_model.py
│       │   ├── gat_model.py
│       │   └── fusion_model.py
│       ├── data/
│       │   └── generate_data.py
│       └── train.py
└── frontend/
└── src/
├── pages/           # All page components
├── components/      # Shared components
└── context/         # Theme & Language context

## 🎯 Use Case

Traditional credit scoring requires formal financial history (bank statements, credit cards, loans). LoanIQ enables micro-lending institutions to assess creditworthiness of unbanked individuals using:

- 📱 Mobile recharge behavior
- 🛒 Grocery spending patterns  
- 💡 Utility bill regularity
- 📍 Location stability
- 🤝 Social trust network

