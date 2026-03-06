from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException
from dotenv import load_dotenv
import os

from database import get_db
from models import Transaction, User

load_dotenv()

router = APIRouter(prefix="/analytics", tags=["Analytics"])
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


# ─── Summary Cards ────────────────────────────────────────
@router.get("/summary")
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    # All time totals
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income"
    ).scalar() or 0

    total_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).scalar() or 0

    # This month
    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income",
        Transaction.date >= month_start
    ).scalar() or 0

    monthly_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= month_start
    ).scalar() or 0

    balance = total_income - total_expense
    savings_rate = ((monthly_income - monthly_expense) / monthly_income * 100) if monthly_income > 0 else 0
    anomaly_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.is_anomaly == True
    ).count()

    return {
        "balance": round(balance, 2),
        "monthly_income": round(monthly_income, 2),
        "monthly_expense": round(monthly_expense, 2),
        "savings_rate": round(savings_rate, 1),
        "anomaly_count": anomaly_count
    }


# ─── Monthly income vs expense (last 12 months) ───────────
@router.get("/monthly")
def get_monthly(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    months = []
    now = datetime.utcnow()

    for i in range(11, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_num = month_date.month
        year_num = month_date.year

        income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            extract("month", Transaction.date) == month_num,
            extract("year", Transaction.date) == year_num
        ).scalar() or 0

        expense = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            extract("month", Transaction.date) == month_num,
            extract("year", Transaction.date) == year_num
        ).scalar() or 0

        months.append({
            "month": month_date.strftime("%b %Y"),
            "income": round(income, 2),
            "expense": round(expense, 2),
            "savings": round(income - expense, 2)
        })

    return months


# ─── Category breakdown ───────────────────────────────────
@router.get("/categories")
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).group_by(Transaction.category).order_by(
        func.sum(Transaction.amount).desc()
    ).all()

    return [{"category": r.category, "total": round(r.total, 2)} for r in results]


# ─── Balance over time ────────────────────────────────────
@router.get("/balance-timeline")
def get_balance_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    months = []
    now = datetime.utcnow()
    running_balance = 0

    for i in range(11, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_num = month_date.month
        year_num = month_date.year

        income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            extract("month", Transaction.date) == month_num,
            extract("year", Transaction.date) == year_num
        ).scalar() or 0

        expense = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            extract("month", Transaction.date) == month_num,
            extract("year", Transaction.date) == year_num
        ).scalar() or 0

        running_balance += income - expense

        months.append({
            "month": month_date.strftime("%b %Y"),
            "balance": round(running_balance, 2)
        })

    return months
