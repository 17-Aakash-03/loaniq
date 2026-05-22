# 🧠 LoanIQ — AI Credit Scoring for Unbanked Populations

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-00fff7?style=for-the-badge&logoColor=white)](https://loaniq-frontend.netlify.app)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-Render-b537f2?style=for-the-badge)](https://loaniq-backend-6dmd.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/📦%20GitHub-Repository-00ff96?style=for-the-badge&logo=github)](https://github.com/17-Aakash-03/loaniq)

![AUC-ROC](https://img.shields.io/badge/AUC--ROC-0.9618-brightgreen?style=flat-square)
![F1 Score](https://img.shields.io/badge/F1%20Score-0.9142-brightgreen?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?style=flat-square&logo=pytorch)

> **Alternative credit scoring system** using behavioral and social graph data for unbanked individuals in India who lack formal credit history.

</div>

---

## 🌐 Live Demo

<div align="center">

### 👉 [https://loaniq-frontend.netlify.app](https://loaniq-frontend.netlify.app)

</div>

---

## 📖 Overview

LoanIQ uses a **Transformer + Graph Attention Network (GAT)** neural network to score loan applicants using alternative data:

- 📱 Mobile recharge patterns
- 💡 Electricity bill regularity
- 🛒 Grocery spending behavior
- 📍 Location stability
- 🤝 Social trust network

**Built for the 190 million unbanked adults in India** who lack formal credit history but have rich behavioral data.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Credit Scoring** | Transformer + GAT neural network (AUC-ROC: 0.9618) |
| 📊 **SHAP Explainability** | Real-time feature impact waterfall charts |
| 📄 **PDF Reports** | Professional downloadable credit reports |
| 📧 **Email Notifications** | Automated score delivery via Gmail |
| 📁 **Batch CSV Scoring** | Score multiple applicants at once |
| 👨‍💼 **Admin Dashboard** | User management and analytics |
| 🔬 **EDA Console** | Exploratory data analysis visualization |
| 🏆 **Model Comparison** | Benchmark against 5 baseline models |
| 🧮 **Loan Calculator** | EMI calculation based on credit score |
| 🎯 **What-If Simulator** | Predict score changes with feature adjustments |
| 📈 **30-Day Prediction** | Score trend forecasting |
| 👥 **Peer Comparison** | Percentile ranking against all applicants |
| 🌙 **Dark/Light Mode** | Full theme support |
| 🇮🇳 **Hindi/English** | Bilingual interface |
| 📱 **Mobile Responsive** | Works on all screen sizes |

---

## 🏗️ Architecture

```
Behavioral Data (12 months) ──→ Transformer Encoder ──→ 128-dim embedding
                                                                  │
                                                                  ▼
Social Graph Data ────────────→ Graph Attention Network ──→ 128-dim embedding
                                                                  │
                                                                  ▼
                                                    Fusion Layer → Score 0-100
```

---

## 📊 Model Performance

| Metric | Score | Benchmark |
|---|---|---|
| **AUC-ROC** | **0.9618** | Industry > 0.80 ✅ |
| **F1 Score** | **0.9142** | Industry > 0.80 ✅ |
| **Precision** | **0.9280** | — |
| **Recall** | **0.9010** | — |
| **Accuracy** | **0.9350** | — |

### vs Baseline Models

| Model | AUC-ROC | F1 |
|---|---|---|
| **Transformer + GAT (Ours)** | **0.9618** | **0.9142** |
| XGBoost | 0.8940 | 0.8560 |
| Random Forest | 0.8650 | 0.8210 |
| LSTM Only | 0.8730 | 0.8320 |
| Logistic Regression | 0.7820 | 0.7340 |

> Our model outperforms XGBoost by **+7.6% AUC-ROC**

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — REST API framework
- **PyTorch 2.2** — Deep learning
- **Transformer Encoder** — Temporal behavioral sequence modeling
- **Graph Attention Network** — Social trust propagation
- **SHAP** — Model explainability
- **SQLite + SQLAlchemy** — Database
- **JWT** — Authentication
- **smtplib** — Email notifications

### Frontend
- **React 19** — UI framework
- **Recharts** — Data visualization
- **jsPDF** — PDF generation
- **canvas-confetti** — Score celebrations
- **Axios** — API calls

### Deployment
- **Render** — Backend hosting
- **Netlify** — Frontend hosting
- **GitHub** — Version control

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
git clone https://github.com/17-Aakash-03/loaniq.git
cd loaniq

python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

python -m uvicorn backend.app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create `.env` in root:

```env
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
SECRET_KEY=your_secret_key
```

---

## 📁 Project Structure

```
loaniq/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI endpoints
│   │   ├── core/
│   │   │   ├── auth.py          # JWT authentication
│   │   │   ├── database.py      # SQLAlchemy models
│   │   │   └── email.py         # Email notifications
│   │   └── schemas/
│   │       └── schemas.py       # Pydantic schemas
│   └── ml/
│       ├── models/
│       │   ├── transformer_model.py
│       │   ├── gat_model.py
│       │   └── fusion_model.py
│       ├── saved_models/        # Trained weights
│       └── train.py
└── frontend/
    └── src/
        ├── pages/               # All page components
        ├── components/          # Shared components
        └── context/             # Theme & Language context
```

---

## 🎯 Use Case

Traditional credit scoring requires formal financial history. LoanIQ enables micro-lending institutions to assess creditworthiness of **unbanked individuals** using:

- 📱 Mobile recharge behavior — financial engagement
- 🛒 Grocery spending patterns — income stability
- 💡 Utility bill regularity — financial responsibility
- 📍 Location stability — rootedness
- 🤝 Social trust network — community standing

---

## 👤 Author

**Aakash Jha**

[![GitHub](https://img.shields.io/badge/GitHub-17--Aakash--03-181717?style=flat-square&logo=github)](https://github.com/17-Aakash-03)

---

---

<div align="center">

### 🚀 [Try LoanIQ Live →](https://loaniq-frontend.netlify.app)


</div>
