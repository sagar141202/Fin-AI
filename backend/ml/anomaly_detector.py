import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CATEGORY_LIST = [
    "Food", "Transport", "Housing", "Entertainment", "Shopping",
    "Health", "Education", "Utilities", "Salary", "Freelance",
    "Investment", "Other"
]


def extract_features(transactions: list) -> np.ndarray:
    """
    Extract features from transactions for Isolation Forest:
    - amount (log-scaled)
    - category (label encoded)
    - hour of day (0-23)
    - day of week (0-6)
    - day of month (1-31)
    """
    features = []
    le = LabelEncoder()
    le.fit(CATEGORY_LIST)

    for tx in transactions:
        date = tx.date if hasattr(tx, "date") else datetime.utcnow()
        try:
            cat_encoded = le.transform([tx.category])[0]
        except ValueError:
            cat_encoded = 0

        features.append([
            np.log1p(tx.amount),        # log-scale amount
            cat_encoded,                 # category
            date.hour,                   # hour of day
            date.weekday(),              # day of week
            date.day,                    # day of month
        ])

    return np.array(features)


def train_model(db: Session, user_id: int) -> dict:
    """Train Isolation Forest on user's transaction history."""
    from models import Transaction

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense"
    ).all()

    if len(transactions) < 10:
        return {"error": "Not enough transactions to train model", "count": len(transactions)}

    features = extract_features(transactions)

    # Train Isolation Forest
    # contamination=0.05 means we expect ~5% anomalies
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )
    model.fit(features)

    # Save model
    model_path = os.path.join(MODELS_DIR, f"user_{user_id}_anomaly.pkl")
    joblib.dump(model, model_path)

    # Score all transactions and update is_anomaly flag
    scores = model.decision_function(features)  # lower = more anomalous
    predictions = model.predict(features)        # -1 = anomaly, 1 = normal

    anomaly_count = 0
    for tx, pred, score in zip(transactions, predictions, scores):
        tx.is_anomaly = (pred == -1)
        if pred == -1:
            anomaly_count += 1

    db.commit()

    return {
        "trained_on": len(transactions),
        "anomalies_found": anomaly_count,
        "anomaly_rate": round(anomaly_count / len(transactions) * 100, 1)
    }


def score_transaction(db: Session, user_id: int, transaction) -> dict:
    """Score a single transaction using saved model."""
    model_path = os.path.join(MODELS_DIR, f"user_{user_id}_anomaly.pkl")

    if not os.path.exists(model_path):
        train_model(db, user_id)

    model = joblib.load(model_path)
    features = extract_features([transaction])

    score = float(model.decision_function(features)[0])
    prediction = int(model.predict(features)[0])
    is_anomaly = prediction == -1

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(score, 4),
        "confidence": round(abs(score) * 100, 1)
    }


def get_anomaly_explanation(transaction, db: Session, user_id: int) -> str:
    """Generate human-readable explanation for why a transaction is flagged."""
    from models import Transaction
    from sqlalchemy import func

    # Get average spend in this category
    avg = db.query(func.avg(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.category == transaction.category,
        Transaction.type == "expense",
        Transaction.id != transaction.id
    ).scalar() or 0

    if avg > 0:
        multiplier = round(transaction.amount / avg, 1)
        if multiplier > 2:
            return f"This transaction is {multiplier}x your usual spend in {transaction.category}"

    # Check time-based anomaly
    hour = transaction.date.hour
    if hour < 6 or hour > 23:
        return f"Unusual transaction time: {hour:02d}:00"

    # Check amount threshold
    if transaction.amount > 1000:
        return f"Large transaction: ₹{transaction.amount:,.2f} in {transaction.category}"

    return f"Unusual spending pattern detected in {transaction.category}"
