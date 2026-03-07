from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import jwt as pyjwt
from jwt.exceptions import InvalidTokenError as JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
import os

from database import get_db
from models import User, Transaction
from ml.spending_predictor import train_and_predict
from ml.anomaly_detector import train_model, score_transaction, get_anomaly_explanation
from ml.budget_analyzer import analyze_budget
from ml.llm_advisor import generate_budget_advice

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI"])
security = HTTPBearer()

def get_secret():
    return os.getenv("SECRET_KEY", "finai-super-secret-2026")
def get_algorithm():
    return os.getenv("ALGORITHM", "HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = pyjwt.decode(token, get_secret(), algorithms=[get_algorithm()])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── Spending prediction ──────────────────────────────────
@router.get("/predict-spending")
def predict_spending(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        predictions = train_and_predict(db, current_user.id)
        if not predictions:
            raise HTTPException(status_code=404, detail="Not enough data to predict")

        total_predicted = sum(
            v["predicted"] if isinstance(v, dict) else v
            for v in predictions.values()
        )
        sorted_cats = sorted(
            predictions.items(),
            key=lambda x: x[1]["predicted"] if isinstance(x[1], dict) else x[1],
            reverse=True
        )
        return {
            "total_predicted_spend": round(total_predicted, 2),
            "categories": predictions,
            "top_categories": [
                {
                    "category": cat,
                    "predicted": data["predicted"] if isinstance(data, dict) else data,
                    "trend": data.get("trend", "stable") if isinstance(data, dict) else "stable"
                }
                for cat, data in sorted_cats[:5]
            ],
            "model": "LinearRegression",
            "trained_on": "Last 12 months of transactions"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ─── Spending trend ───────────────────────────────────────
@router.get("/spending-trend")
def spending_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        now = datetime.utcnow()
        monthly_totals = []

        for i in range(11, -1, -1):
            month_date = now - timedelta(days=30 * i)
            total = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user.id,
                Transaction.type == "expense",
                extract("month", Transaction.date) == month_date.month,
                extract("year", Transaction.date) == month_date.year
            ).scalar() or 0

            monthly_totals.append({
                "month": month_date.strftime("%b %Y"),
                "actual": round(float(total), 2),
                "predicted": None
            })

        X = np.array(range(12)).reshape(-1, 1)
        y = np.array([m["actual"] for m in monthly_totals])
        model = LinearRegression()
        model.fit(X, y)
        next_pred = float(model.predict([[12]])[0])
        std = float(np.std(y))

        next_month = (now + timedelta(days=30)).strftime("%b %Y")
        monthly_totals.append({
            "month": next_month,
            "actual": None,
            "predicted": round(max(0, next_pred), 2),
            "lower": round(max(0, next_pred - std), 2),
            "upper": round(next_pred + std, 2)
        })

        return monthly_totals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend failed: {str(e)}")


# ─── Train anomaly detection model ───────────────────────
@router.post("/train-anomaly-model")
def train_anomaly_model(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = train_model(db, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


# ─── Get all flagged anomalies ────────────────────────────
@router.get("/detect-anomalies")
def detect_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Auto-train if needed
        from ml.anomaly_detector import MODELS_DIR
        model_path = os.path.join(MODELS_DIR, f"user_{current_user.id}_anomaly.pkl")
        if not os.path.exists(model_path):
            train_model(db, current_user.id)

        anomalies = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.is_anomaly == True
        ).order_by(Transaction.amount.desc()).all()

        result = []
        for tx in anomalies:
            explanation = get_anomaly_explanation(tx, db, current_user.id)
            result.append({
                "id": tx.id,
                "amount": tx.amount,
                "category": tx.category,
                "merchant": tx.merchant,
                "date": tx.date.isoformat(),
                "type": tx.type,
                "explanation": explanation
            })

        return {
            "total_anomalies": len(result),
            "anomalies": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


# ─── Score a single transaction ───────────────────────────
@router.get("/score-transaction/{transaction_id}")
def score_single(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    result = score_transaction(db, current_user.id, tx)
    result["explanation"] = get_anomaly_explanation(tx, db, current_user.id)
    return result

# ─── Budget recommendations ───────────────────────────────
@router.get("/budget-insights")
def budget_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = analyze_budget(db, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget analysis failed: {str(e)}")

# ─── LLM Budget Advice ───────────────────────────────────
@router.get("/llm-advice")
def llm_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        budget_data = analyze_budget(db, current_user.id)
        advice = generate_budget_advice(budget_data)
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM advice failed: {str(e)}")
