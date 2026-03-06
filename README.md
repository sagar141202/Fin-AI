# Fin-AI — Personal Finance Dashboard with AI

A full-stack personal finance dashboard with ML-powered anomaly detection and spending forecasts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI + PostgreSQL |
| ML | Isolation Forest + Prophet |
| Auth | JWT tokens |
| DevOps | Docker + GitHub Actions |

## Features

- JWT authentication (register/login)
- Transaction tracking with categories
- Income vs Expense charts
- AI anomaly detection on transactions
- Spending forecast with Prophet ML
- Financial health score

## Quick Start

### With Docker (recommended)
```bash
docker-compose up --build
```

### Without Docker

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd finance-dashboard
npm install
npm run dev
```

## Project Structure
```
Fin-AI/
├── backend/              # FastAPI + PostgreSQL
│   ├── routers/          # API endpoints
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   └── main.py           # App entry point
├── finance-dashboard/    # React frontend
│   └── src/
│       ├── api/          # Axios API calls
│       ├── components/   # Reusable UI
│       ├── pages/        # Route pages
│       └── store/        # Auth context
└── docker-compose.yml    # Full stack setup
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login + get JWT |
| GET | /transactions | Get all transactions |
| POST | /transactions | Add transaction |
| GET | /ml/anomalies | Get flagged transactions |
| GET | /ml/forecast | Get spending forecast |

## Roadmap

- [x] Week 1 — Project setup + Auth
- [x] Week 2 — Dashboard UI + Docker
- [ ] Week 3 — Transaction CRUD + Charts
- [ ] Week 4 — ML anomaly detection
- [ ] Week 5 — Prophet forecasting
- [ ] Week 6 — CI/CD pipeline
- [ ] Week 7 — Polish + deployment
