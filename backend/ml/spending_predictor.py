import numpy as np
import joblib
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from sklearn.linear_model import LinearRegression

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def get_monthly_spending(db: Session, user_id: int) -> dict:
    """Get last 12 months of spending per category."""
    from models import Transaction

    now = datetime.utcnow()
    data = {}  # {category: [amount_month0, amount_month1, ...]}

    for i in range(12):
        month_date = now - timedelta(days=30 * i)
        month_num = month_date.month
        year_num = month_date.year

        results = db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            extract("month", Transaction.date) == month_num,
            extract("year", Transaction.date) == year_num
        ).group_by(Transaction.category).all()

        for row in results:
            if row.category not in data:
                data[row.category] = {}
            data[row.category][11 - i] = float(row.total)

    # Fill missing months with 0
    for category in data:
        for month_idx in range(12):
            if month_idx not in data[category]:
                data[category][month_idx] = 0.0

    return data


def train_and_predict(db: Session, user_id: int) -> dict:
    """Train LinearRegression per category, predict next month."""
    data = get_monthly_spending(db, user_id)

    if not data:
        return {}

    predictions = {}

    for category, monthly_amounts in data.items():
        X = np.array(sorted(monthly_amounts.keys())).reshape(-1, 1)
        y = np.array([monthly_amounts[k] for k in sorted(monthly_amounts.keys())])

        # Need at least 3 months of data
        if np.count_nonzero(y) < 3:
            avg = float(np.mean(y[y > 0])) if np.any(y > 0) else 0
            predictions[category] = {
                "predicted": round(avg, 2),
                "lower": round(avg * 0.8, 2),
                "upper": round(avg * 1.2, 2),
                "avg_last_3_months": round(avg, 2),
                "trend": "stable"
            }
            continue

        model = LinearRegression()
        model.fit(X, y)

        next_pred = float(model.predict([[12]])[0])
        next_pred = max(0, next_pred)
        std = float(np.std(y))

        trend = "stable"
        if model.coef_[0] > 50:
            trend = "increasing"
        elif model.coef_[0] < -50:
            trend = "decreasing"

        predictions[category] = {
            "predicted": round(next_pred, 2),
            "lower": round(max(0, next_pred - std), 2),
            "upper": round(next_pred + std, 2),
            "avg_last_3_months": round(float(np.mean(y[-3:])), 2),
            "trend": trend
        }

    # Save models
    model_path = os.path.join(MODELS_DIR, f"user_{user_id}_spending.pkl")
    joblib.dump(predictions, model_path)

    return predictions
