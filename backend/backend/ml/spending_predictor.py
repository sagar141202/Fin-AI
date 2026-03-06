import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def get_monthly_category_spending(db: Session, user_id: int) -> pd.DataFrame:
    """Fetch last 12 months of spending per category from DB."""
    now = datetime.utcnow()
    rows = []

    for i in range(12):
        month_date = now - timedelta(days=30 * i)
        month_num = month_date.month
        year_num = month_date.year

        results = db.query(
            func.sum(func.cast(func.coalesce(
                db.query(func.sum(__import__('models').Transaction.amount))
                .filter_by(user_id=user_id, type="expense")
                .scalar(), 0
            ), __import__('sqlalchemy').Float))
        )

        # Simpler direct query
        from models import Transaction
        from sqlalchemy import extract as ext

        cat_results = db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            ext("month", Transaction.date) == month_num,
            ext("year", Transaction.date) == year_num
        ).group_by(Transaction.category).all()

        for row in cat_results:
            rows.append({
                "month_index": 11 - i,  # 0 = oldest, 11 = most recent
                "month": month_date.strftime("%b %Y"),
                "category": row.category,
                "amount": float(row.total)
            })

    return pd.DataFrame(rows)


def train_and_predict(db: Session, user_id: int) -> dict:
    """
    Train a LinearRegression model per category on last 12 months
    and predict next month's spending.
    Returns dict of {category: predicted_amount}
    """
    df = get_monthly_category_spending(db, user_id)

    if df.empty:
        return {}

    predictions = {}
    models = {}

    categories = df["category"].unique()

    for category in categories:
        cat_df = df[df["category"] == category].sort_values("month_index")

        # Need at least 3 data points to predict
        if len(cat_df) < 3:
            predictions[category] = float(cat_df["amount"].mean())
            continue

        X = cat_df["month_index"].values.reshape(-1, 1)
        y = cat_df["amount"].values

        model = LinearRegression()
        model.fit(X, y)

        # Predict month index 12 (next month)
        next_month_idx = np.array([[12]])
        predicted = float(model.predict(next_month_idx)[0])

        # Clamp to non-negative
        predicted = max(0, predicted)

        # Add some variance context
        std = float(np.std(y))
        predictions[category] = {
            "predicted": round(predicted, 2),
            "lower": round(max(0, predicted - std), 2),
            "upper": round(predicted + std, 2),
            "avg_last_3_months": round(float(np.mean(y[-3:])), 2),
            "trend": "increasing" if model.coef_[0] > 10 else
                     "decreasing" if model.coef_[0] < -10 else "stable"
        }

        models[category] = model

    # Save models to disk
    model_path = os.path.join(MODELS_DIR, f"user_{user_id}_spending.pkl")
    joblib.dump(models, model_path)

    return predictions


def load_predictions(user_id: int) -> dict:
    """Load saved model predictions if they exist."""
    model_path = os.path.join(MODELS_DIR, f"user_{user_id}_spending.pkl")
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None
