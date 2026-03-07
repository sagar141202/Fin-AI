# 💰 Fin-AI — Intelligent Personal Finance Dashboard

> A production-grade, AI-powered full-stack finance dashboard with a native Android app.  
> Built as a portfolio project demonstrating full-stack engineering, ML integration, DevOps, and mobile delivery.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-finai--frontend--xi.vercel.app-blue?style=for-the-badge)](https://finai-frontend-xi.vercel.app)
[![API Docs](https://img.shields.io/badge/📡_API_Docs-Swagger_UI-green?style=for-the-badge)](https://finai-backend-omega.vercel.app/docs)
[![Download APK](https://img.shields.io/badge/📱_Android_APK-Download-orange?style=for-the-badge)](https://github.com/sagar141202/Fin-AI/actions)

</div>

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?logo=scikitlearn&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-FF6B35)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)
![Android](https://img.shields.io/badge/Android-Capacitor_APK-3DDC84?logo=android&logoColor=white)

</div>

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure register/login with protected routes and token expiry |
| 💳 **Transaction Management** | Full CRUD — add, edit, delete, search, filter, paginate |
| 📊 **Analytics Dashboard** | Income vs expenses, category breakdown, balance timeline charts |
| 🤖 **ML Spending Forecasts** | Linear regression predictions per category |
| 🚨 **Anomaly Detection** | Isolation Forest flags unusual or suspicious transactions |
| 💡 **AI Budget Advisor** | 50/30/20 rule analysis + Groq Llama 3.3 70B natural language advice |
| 🌓 **Dark / Light Mode** | Persistent theme toggle across all pages |
| 📱 **Mobile Responsive** | Bottom nav bar, hamburger drawer, fully optimised for all screen sizes |
| 🤖 **Android App** | Native APK built via GitHub Actions CI — no Play Store needed |
| ⚙️ **CI/CD Pipeline** | Automated pytest + ESLint + Docker build on every push to main |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│                                                                  │
│   🌐 Web Browser                    📱 Android App (APK)        │
│   React 18 + Vite + TailwindCSS     Capacitor wrapper           │
│   Recharts + React Router v6        Same React codebase         │
│   Deployed on Vercel                Built via GitHub Actions     │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS REST API
┌───────────────────────────▼──────────────────────────────────────┐
│                         BACKEND LAYER                            │
│                                                                  │
│   FastAPI + Python 3.10 + SQLAlchemy                            │
│   Serverless Functions on Vercel                                 │
│                                                                  │
│   ┌──────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐  │
│   │  /auth   │ │/transactions│ │ /analytics  │ │    /ai     │  │
│   │ register │ │ CRUD + page │ │ charts data │ │ ML + LLM   │  │
│   │  login   │ │ filter/sort │ │  summaries  │ │  advice    │  │
│   └──────────┘ └─────────────┘ └─────────────┘ └─────┬──────┘  │
│                                                       │         │
│   ┌───────────────────────────────────────────────────▼──────┐  │
│   │                    ML LAYER (scikit-learn)                │  │
│   │   LinearRegression │ IsolationForest │ BudgetAnalyzer     │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                       │         │
│   ┌───────────────────────────────────────────────────▼──────┐  │
│   │             Groq API — Llama 3.3 70B (Free Tier)         │  │
│   │          Personalised financial advice in seconds         │  │
│   └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                        DATABASE LAYER                            │
│                                                                  │
│   PostgreSQL via Supabase (Free, always-on, IPv6 pooler)        │
│   Tables: users, transactions                                    │
│   Connection: PgBouncer pooler for serverless compatibility      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** + **Vite** | Fast SPA with HMR |
| **TailwindCSS** | Utility-first responsive styling |
| **Recharts** | Interactive analytics charts |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Icon library |
| **Capacitor** | Android APK wrapper |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Async Python REST API |
| **SQLAlchemy** | ORM with PostgreSQL |
| **PyJWT** | JWT authentication |
| **Passlib + bcrypt** | Password hashing |
| **scikit-learn** | ML models (LinearRegression, IsolationForest) |
| **Groq SDK** | Llama 3.3 70B AI advice (free tier) |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database (free, always-on) |
| **Vercel** | Frontend + backend serverless deployment |
| **GitHub Actions** | CI/CD — pytest + ESLint + Docker + APK build |
| **Docker** | Containerisation for local dev |

---

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 22+
- PostgreSQL (or Supabase account)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://your_db_url
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your-groq-api-key
FRONTEND_URL=http://localhost:5173
EOF

# Seed database with 485 realistic transactions
python seed.py

# Start server
uvicorn main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend Setup
```bash
cd finance-dashboard
npm install

echo "VITE_API_URL=http://127.0.0.1:8000" > .env.development

npm run dev
# App available at http://localhost:5173
```

---

## 🧪 Testing

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

**Test Coverage:**

| File | Tests | Coverage |
|------|-------|----------|
| `test_auth.py` | 6 tests | Register, login, duplicate detection, invalid credentials |
| `test_transactions.py` | 5 tests | CRUD, auth guards, pagination, validation |
| `test_analytics.py` | 4 tests | Summary, monthly breakdown, categories, timeline |

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers two GitHub Actions workflows:

```
Push to main
    │
    ├── 🔄 Fin-AI CI/CD Pipeline
    │       ├── Backend Tests (pytest) ────► 15/15 pass ✅
    │       ├── Frontend Lint (ESLint) ────► 0 errors  ✅
    │       └── Docker Build Check ─────── ► builds OK ✅
    │
    └── 📱 Build Android APK
            ├── Node 22 + Java 21 setup
            ├── React build → Capacitor sync
            ├── Gradle assembleDebug
            └── APK uploaded as artifact ✅
```

---

## 📱 Android App

The Android APK is automatically built on every push via GitHub Actions:

1. Go to **Actions → Build Android APK → latest run**
2. Scroll to **Artifacts** → download **fin-ai-debug-apk**
3. Unzip → install `app-debug.apk` on any Android phone
4. Enable **"Install from unknown sources"** if prompted

The app is a native wrapper around the live Vercel deployment — all features work identically.

---

## 🌍 Environment Variables

### Backend (`.env` + Vercel)
```env
DATABASE_URL=postgresql://...supabase.com/postgres   # Supabase pooler URL
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=gsk_...                                  # Free at console.groq.com
FRONTEND_URL=https://finai-frontend-xi.vercel.app
```

### Frontend (`.env.development` + Vercel)
```env
VITE_API_URL=https://finai-backend-omega.vercel.app
```

---

## 📁 Project Structure

```
project_finance_dashboard/
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── models.py                   # SQLAlchemy models
│   ├── schemas.py                  # Pydantic schemas
│   ├── database.py                 # DB connection + engine
│   ├── seed.py                     # 485 realistic transactions
│   ├── vercel.json                 # Vercel serverless config
│   ├── routers/
│   │   ├── auth.py                 # JWT auth endpoints
│   │   ├── transactions.py         # CRUD endpoints
│   │   ├── analytics.py            # Chart data endpoints
│   │   └── ai.py                   # ML + AI advice endpoints
│   ├── ml/
│   │   ├── spending_predictor.py   # LinearRegression forecasts
│   │   ├── anomaly_detector.py     # IsolationForest detection
│   │   ├── budget_analyzer.py      # 50/30/20 rule engine
│   │   └── llm_advisor.py          # Groq Llama 3.3 70B advice
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_transactions.py
│   │   ├── test_analytics.py
│   │   ├── test_ml.py
│   │   └── test_edge_cases.py
│   └── requirements.txt
├── finance-dashboard/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Layout + mobile nav
│   │   │   ├── Overview.jsx        # Charts + analytics
│   │   │   ├── Transactions.jsx    # Transaction management
│   │   │   ├── Anomalies.jsx       # Anomaly detection UI
│   │   │   ├── BudgetInsights.jsx  # AI budget advice
│   │   │   ├── Login.jsx           # Auth pages
│   │   │   └── Register.jsx
│   │   ├── api/
│   │   │   ├── auth.js             # Auth API calls
│   │   │   ├── transactions.js     # Transaction API calls
│   │   │   ├── analytics.js        # Analytics API calls
│   │   │   └── config.js           # API base URL config
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Auth hook
│   │   │   └── useTheme.js         # Dark/light mode hook
│   │   └── store/
│   │       ├── AuthContext.jsx     # Auth provider
│   │       └── AuthContextDef.jsx  # Context definition
│   ├── android/                    # Capacitor Android project
│   ├── capacitor.config.json       # Capacitor configuration
│   └── vercel.json
├── .github/
│   └── workflows/
│       ├── ci.yml                  # CI/CD pipeline
│       └── build-apk.yml           # Android APK builder
├── docs/
│   └── ARCHITECTURE.md
├── docker-compose.yml
└── README.md
```

---

## 🗺️ Development Journey

- [x] **Week 1** — JWT auth system (register, login, protected routes)
- [x] **Week 2** — Transaction CRUD with pagination, filtering, search
- [x] **Week 3** — Analytics dashboard with Recharts visualisations
- [x] **Week 4** — ML spending prediction (LinearRegression per category)
- [x] **Week 5** — Anomaly detection (IsolationForest flags unusual spend)
- [x] **Week 6** — AI budget insights (50/30/20 rule + LLM advice)
- [x] **Week 7** — CI/CD pipeline (GitHub Actions: pytest + ESLint + Docker)
- [x] **Week 8** — Production deployment (Vercel + Supabase), mobile responsive UI, Android APK

---

## 🤝 Key Engineering Decisions

| Challenge | Solution |
|-----------|----------|
| Vercel IPv6 vs Supabase IPv4 | Used Supabase PgBouncer pooler URL |
| `python-jose` broken on Vercel | Replaced with `PyJWT==2.8.0` |
| JWT secrets not loading serverless | Load `SECRET_KEY` dynamically via `os.getenv()` inside functions |
| ESLint fast-refresh error | Split `AuthContext` + moved `useAuth` to separate hooks file |
| Gemini free tier quota exhausted | Switched to Groq Llama 3.3 70B (truly free, no daily limits) |
| No Android Studio on Mac | Built APK entirely in GitHub Actions CI cloud (Java 21 + Gradle) |

---

## 👨‍💻 Author

**Sagar Maddi**  
Full-stack portfolio project demonstrating React, FastAPI, PostgreSQL, ML with scikit-learn, LLM integration, CI/CD pipelines, and mobile app delivery.

---

## 📄 License

MIT License — feel free to use this as a reference or starting point.