# 🏦 AI-Powered Personal Finance Dashboard
## Complete Project Roadmap — HSBC Engineering Graduate Prep

---

## 📌 Project Overview

**Goal:** Build a full-stack, AI-powered personal finance dashboard that demonstrates digital banking skills directly relevant to HSBC's Engineering Graduate Programme.

**What it showcases:**
- Full-stack development (React + FastAPI/Node.js)
- AI/ML integration (spending prediction, anomaly detection)
- Real-time data handling
- Secure authentication
- DevOps (Docker, CI/CD)
- Scalable system design

**Timeline:** ~6–8 weeks (part-time)

---

## 🗂️ Folder Structure

```
finance-dashboard/
├── frontend/                        # React.js app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/           # Main dashboard layout
│   │   │   ├── Charts/              # Recharts / D3 visualizations
│   │   │   ├── Transactions/        # Transaction list + filters
│   │   │   ├── AI/                  # AI insights panel
│   │   │   └── Auth/                # Login / Register
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # Auth context, Theme context
│   │   ├── services/                # API call functions (axios)
│   │   ├── utils/                   # Formatters, helpers
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
├── backend/                         # FastAPI (Python) or Node.js/Express
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py              # JWT auth endpoints
│   │   │   ├── transactions.py      # CRUD for transactions
│   │   │   ├── analytics.py         # Aggregated stats
│   │   │   └── ai.py               # ML prediction endpoints
│   │   ├── models/                  # SQLAlchemy DB models
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── analytics_service.py
│   │   │   └── ml_service.py       # AI/ML logic lives here
│   │   ├── database.py
│   │   └── main.py
│   ├── ml/
│   │   ├── train_model.py           # Model training script
│   │   ├── anomaly_detector.py      # Isolation Forest / LSTM
│   │   ├── spending_predictor.py    # Linear Regression / Prophet
│   │   └── models/                  # Saved .pkl / .h5 model files
│   ├── Dockerfile
│   └── requirements.txt
│
├── database/
│   ├── init.sql                     # Schema setup
│   └── seed_data.sql                # Mock transactions for dev
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD pipeline
│
├── docker-compose.yml               # Orchestrates all services
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js + Vite | Fast, modern, industry standard |
| Styling | Tailwind CSS | Rapid, responsive UI |
| Charts | Recharts + D3.js | Rich data visualization |
| Backend | FastAPI (Python) | Fast, async, great for ML integration |
| Database | PostgreSQL | Production-grade relational DB |
| ORM | SQLAlchemy + Alembic | DB models + migrations |
| Auth | JWT + bcrypt | Secure, stateless authentication |
| AI/ML | scikit-learn + Prophet | Anomaly detection + spending forecast |
| Caching | Redis | Session caching, rate limiting |
| DevOps | Docker + Docker Compose | Containerized local dev |
| CI/CD | GitHub Actions | Automated test + build pipeline |

---

## 📅 Week-by-Week Roadmap

### ✅ Week 1 — Project Setup & Auth
**Goal:** Running project skeleton with working login/register

**Tasks:**
- [ ] Initialize React + Vite frontend project
- [ ] Set up FastAPI backend with PostgreSQL connection
- [ ] Implement User model (id, email, hashed_password, created_at)
- [ ] Build `/register` and `/login` endpoints with JWT tokens
- [ ] Create Auth context in React (store token, protect routes)
- [ ] Build Login + Register pages (form validation with React Hook Form)
- [ ] Set up Docker + docker-compose for frontend, backend, PostgreSQL
- [ ] Initialize GitHub repo with proper `.gitignore` and branch strategy

**Deliverable:** You can register, log in, and get a JWT token. Routes are protected.

---

### ✅ Week 2 — Transaction CRUD & Database
**Goal:** Full transaction management system

**Tasks:**
- [ ] Design Transaction model: (id, user_id, amount, category, merchant, date, type: income/expense)
- [ ] Build REST API: `GET /transactions`, `POST /transactions`, `PUT`, `DELETE`
- [ ] Add pagination, filtering by date range + category
- [ ] Create mock data seed script (500+ realistic transactions)
- [ ] Build Transactions table in React with search, filter, sort
- [ ] Add "Add Transaction" modal with form

**Deliverable:** Full CRUD for transactions in the UI.

---

### ✅ Week 3 — Analytics & Dashboard Core
**Goal:** Main dashboard with real charts and stats

**Tasks:**
- [ ] Build analytics endpoints: monthly totals, category breakdown, income vs. expense
- [ ] Build Summary Cards component (Total Balance, Monthly Income, Monthly Spend, Savings Rate)
- [ ] Line chart — Balance over time (last 12 months)
- [ ] Pie/Donut chart — Spending by category
- [ ] Bar chart — Monthly income vs. expenses comparison
- [ ] Date range selector for filtering all charts
- [ ] Responsive layout using Tailwind grid

**Deliverable:** A beautiful, interactive dashboard with real data.

---

### ✅ Week 4 — AI Feature 1: Spending Prediction
**Goal:** Forecast next month's spending using ML

**Tasks:**
- [ ] Install `prophet` or use `scikit-learn` LinearRegression
- [ ] Write `spending_predictor.py`:
  - Takes last 6–12 months of category-wise spending
  - Predicts next month's spending per category
- [ ] Train on seed data, save model as `.pkl`
- [ ] Build `/ai/predict-spending` endpoint
- [ ] Add "AI Forecast" card to dashboard showing predicted spend
- [ ] Add confidence interval visualization on line chart

**Learning outcome:** Time series forecasting, model serialization, serving ML via REST API.

---

### ✅ Week 5 — AI Feature 2: Anomaly Detection
**Goal:** Flag suspicious/unusual transactions automatically

**Tasks:**
- [ ] Implement `anomaly_detector.py` using Isolation Forest (scikit-learn)
- [ ] Train model on transaction history (amount, category, time-of-day features)
- [ ] Score each new transaction — flag if anomaly score > threshold
- [ ] Add `is_anomaly` flag to Transaction model
- [ ] Build `/ai/detect-anomalies` endpoint (runs on-demand or on transaction creation)
- [ ] Add "Flagged Transactions" section in UI with alert badges
- [ ] Add explainability text: "This transaction is 3x your usual spend in Dining"

**Learning outcome:** Unsupervised ML, feature engineering, real-world fraud detection simulation.

---

### ✅ Week 6 — AI Feature 3: Smart Budget Recommendations
**Goal:** AI-generated natural language budget insights

**Tasks:**
- [ ] Analyze spending patterns vs. 50/30/20 rule
- [ ] Generate rule-based insights: "You spent 40% more on Entertainment this month"
- [ ] (Optional advanced) Call OpenAI / Gemini API to generate natural language advice
- [ ] Build "AI Insights" panel — show 3–5 personalized tips
- [ ] Add budget goal setting: user sets monthly budget per category
- [ ] Visual progress bars: budget used vs. limit per category

**Learning outcome:** LLM integration, rule-based AI logic, UX for AI outputs.

---

### ✅ Week 7 — DevOps & CI/CD Pipeline
**Goal:** Production-ready pipeline

**Tasks:**
- [ ] Write GitHub Actions workflow (`.github/workflows/ci.yml`):
  - Lint frontend (ESLint)
  - Run backend tests (pytest)
  - Build Docker images
  - (Optional) Deploy to Render / Railway / Fly.io
- [ ] Add SonarCloud integration for code quality score
- [ ] Write unit tests for:
  - Auth endpoints (pytest)
  - Analytics calculation functions
  - ML prediction functions
- [ ] Add Redis caching for analytics endpoints
- [ ] Write proper README with architecture diagram

**Learning outcome:** CI/CD, testing, containerization — exactly what HSBC uses.

---

### ✅ Week 8 — Polish, Deploy & Document
**Goal:** Portfolio-ready, deployed, documented

**Tasks:**
- [ ] Deploy backend to Render / Railway (free tier)
- [ ] Deploy frontend to Vercel / Netlify
- [ ] Add proper error handling and loading states everywhere
- [ ] Add dark/light mode toggle
- [ ] Record a 2-minute demo video
- [ ] Write architecture documentation with diagrams (draw.io / Excalidraw)
- [ ] Add to GitHub with proper README: setup, architecture, features, screenshots

---

## 🤖 AI/ML Components Deep Dive

### 1. Spending Predictor
```python
# ml/spending_predictor.py
from prophet import Prophet
import pandas as pd

def train_spending_model(transactions_df):
    # transactions_df: [ds (date), y (amount), category]
    model = Prophet(yearly_seasonality=True, weekly_seasonality=False)
    model.fit(transactions_df[['ds', 'y']])
    return model

def predict_next_month(model):
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
```

### 2. Anomaly Detector
```python
# ml/anomaly_detector.py
from sklearn.ensemble import IsolationForest
import numpy as np

def train_anomaly_model(transactions):
    features = extract_features(transactions)  # amount, hour, day_of_week, category_encoded
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    return model

def score_transaction(model, transaction):
    features = extract_features([transaction])
    score = model.decision_function(features)[0]
    is_anomaly = model.predict(features)[0] == -1
    return {"is_anomaly": bool(is_anomaly), "anomaly_score": float(score)}
```

---

## 🔒 Security Features to Implement

- JWT token expiry + refresh tokens
- Password hashing with bcrypt (never store plain passwords)
- Rate limiting on auth endpoints (using slowapi)
- Input validation with Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration
- Environment variables for all secrets (never hardcode)

---

## 📈 What This Demonstrates to HSBC

| HSBC JD Requirement | Project Feature |
|---|---|
| Digital-first products | Full-stack banking app |
| AI tools | ML spending prediction + anomaly detection |
| DevOps practices | Docker + GitHub Actions CI/CD |
| Scalable systems | Microservice-ready architecture, Redis caching |
| Code quality | Linting, testing, SonarCloud |
| Problem solving | Fraud detection, budget optimization |
| Collaboration | GitHub PRs, proper branching strategy |

---

## 🚀 Getting Started (Quick Setup)

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/finance-dashboard
cd finance-dashboard

# Start all services
docker-compose up --build

# Backend runs at: http://localhost:8000
# Frontend runs at: http://localhost:5173
# API docs at:      http://localhost:8000/docs  ← FastAPI auto-generates this!
```

---

## 📚 Learning Resources

| Topic | Resource |
|---|---|
| FastAPI | https://fastapi.tiangolo.com/tutorial/ |
| SQLAlchemy | https://docs.sqlalchemy.org/ |
| React Query | https://tanstack.com/query/latest |
| Prophet | https://facebook.github.io/prophet/ |
| Isolation Forest | sklearn docs |
| Docker Compose | https://docs.docker.com/compose/ |
| GitHub Actions | https://docs.github.com/en/actions |

---

*Built for HSBC Engineering Graduate Programme preparation | Stack: React + FastAPI + PostgreSQL + scikit-learn + Docker*
