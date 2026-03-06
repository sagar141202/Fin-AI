from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
import os

from database import get_db
from models import User, Transaction
from ml.spending_predictor import train_and_predict

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI"])
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


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

        # Predict next month
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
