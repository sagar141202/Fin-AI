# 🏦 Fin-AI — Intelligent Finance Dashboard

> A full-stack AI-powered personal finance dashboard built as a portfolio project for HSBC.  
> Live Demo: [finai-frontend-xi.vercel.app](https://finai-frontend-xi.vercel.app)  
> Backend API: [finai-backend-omega.vercel.app/docs](https://finai-backend-omega.vercel.app/docs)

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=postgresql)
![Python](https://img.shields.io/badge/Python-3.10-yellow?logo=python)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black?logo=githubactions)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## 📸 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth** | JWT-based register/login with protected routes |
| 💳 **Transactions** | Full CRUD — add, edit, delete, search, filter, paginate |
| 📊 **Analytics** | Income vs expenses, category breakdown, balance timeline |
| 🤖 **ML Forecasting** | Linear regression spending predictions per category |
| 🚨 **Anomaly Detection** | Isolation Forest flags unusual transactions |
| 💡 **AI Budget Insights** | 50/30/20 rule analysis + Claude AI natural language advice |
| ⚙️ **CI/CD** | GitHub Actions — pytest, ESLint, Docker build on every push |

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│   React 18 + Vite + TailwindCSS + Recharts                  │
│   Hosted on Vercel (Static Site)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS REST API
┌──────────────────────▼──────────────────────────────────────┐
│                      BACKEND                                │
│   FastAPI + Python 3.10 + SQLAlchemy                        │
│   Hosted on Vercel (Serverless Functions)                   │
│                                                             │
│   ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐  │
│   │  /auth  │ │  /trans  │ │/analytics │ │    /ai      │  │
│   └─────────┘ └──────────┘ └───────────┘ └──────┬──────┘  │
│                                                  │         │
│   ┌──────────────────────────────────────────────▼──────┐  │
│   │              ML Layer (scikit-learn)                 │  │
│   │  LinearRegression │ IsolationForest │ BudgetAnalyzer │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                  │         │
│   ┌───────────────────────────────────────────── ▼──────┐  │
│   │           Anthropic Claude API (claude-sonnet)       │  │
│   └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     DATABASE                                │
│   PostgreSQL via Supabase (Free, always-on)                 │
│   Tables: users, transactions                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — fast SPA
- **TailwindCSS** — utility-first styling
- **Recharts** — analytics charts
- **React Hook Form** — form validation
- **Axios** — HTTP client
- **React Router v6** — client-side routing

### Backend
- **FastAPI** — async Python REST API
- **SQLAlchemy** — ORM with PostgreSQL
- **PyJWT** — JWT authentication
- **Passlib + bcrypt** — password hashing
- **scikit-learn** — ML models
- **Anthropic SDK** — Claude AI integration

### Infrastructure
- **Supabase** — PostgreSQL database (free tier)
- **Vercel** — frontend + backend deployment
- **GitHub Actions** — CI/CD pipeline
- **Docker** — containerisation

---

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or Supabase account)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY

# Seed database
python seed.py

# Start server
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd finance-dashboard
npm install

# Create .env.development
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.development

npm run dev
```

---

## 🧪 Testing
```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

**15/15 tests passing:**
- `test_auth.py` — register, login, duplicate detection
- `test_transactions.py` — CRUD, auth guards, validation
- `test_analytics.py` — summary, monthly, categories, timeline

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers GitHub Actions:
```
Push to main
    │
    ├── Backend Tests (pytest) ──────► 15/15 pass ✅
    ├── Frontend Lint (ESLint) ──────► 0 errors ✅
    └── Docker Build Check ──────────► builds OK ✅
```

---

## 📁 Project Structure
```
project_finance_dashboard/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # DB connection
│   ├── seed.py              # 485 realistic transactions
│   ├── routers/
│   │   ├── auth.py          # JWT auth endpoints
│   │   ├── transactions.py  # CRUD endpoints
│   │   ├── analytics.py     # Chart data endpoints
│   │   └── ai.py            # ML + AI endpoints
│   ├── ml/
│   │   ├── spending_predictor.py   # LinearRegression
│   │   ├── anomaly_detector.py     # IsolationForest
│   │   ├── budget_analyzer.py      # 50/30/20 rule
│   │   └── llm_advisor.py          # Claude API
│   └── tests/
│       ├── test_auth.py
│       ├── test_transactions.py
│       └── test_analytics.py
├── finance-dashboard/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Overview.jsx        # Dashboard + charts
│   │   │   ├── Transactions.jsx    # Transaction management
│   │   │   ├── Anomalies.jsx       # Anomaly detection
│   │   │   └── BudgetInsights.jsx  # AI budget advice
│   │   ├── api/                    # Axios API calls
│   │   ├── hooks/                  # Custom React hooks
│   │   └── store/                  # Auth context
│   └── vercel.json
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions pipeline
└── docker-compose.yml
```

---

## 🗺️ Development Roadmap

- [x] Week 1 — Auth system (JWT, register, login)
- [x] Week 2 — Transaction CRUD with pagination & filtering
- [x] Week 3 — Analytics dashboard with charts
- [x] Week 4 — ML spending prediction (LinearRegression)
- [x] Week 5 — Anomaly detection (IsolationForest)
- [x] Week 6 — AI budget insights (Claude API)
- [x] Week 7 — CI/CD pipeline (GitHub Actions + Docker)
- [ ] Week 8 — SonarCloud, Redis caching, expanded tests

---

## 👨‍💻 Author

**Sagar Maddi**  
Built as a portfolio project demonstrating full-stack development, ML integration, and DevOps practices.

---

## 📄 License

MIT License — feel free to use this as a reference.
