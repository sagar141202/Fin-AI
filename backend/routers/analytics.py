from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime, timedelta
import jwt as pyjwt
from jwt.exceptions import InvalidTokenError as JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException
from dotenv import load_dotenv
import os

from database import get_db
from models import Transaction, User

load_dotenv()

router = APIRouter(prefix="/analytics", tags=["Analytics"])
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


@router.get("/summary")
def get_summary(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    def base_query(tx_type):
        q = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == tx_type
        )
        if date_from: q = q.filter(Transaction.date >= date_from)
        if date_to: q = q.filter(Transaction.date <= date_to)
        return q.scalar() or 0

    total_income = base_query("income")
    total_expense = base_query("expense")

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    def monthly_query(tx_type):
        return db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == tx_type,
            Transaction.date >= month_start
        ).scalar() or 0

    monthly_income = monthly_query("income")
    monthly_expense = monthly_query("expense")

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


@router.get("/monthly")
def get_monthly(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    months = []
    now = datetime.utcnow()

    for i in range(11, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_num = month_date.month
        year_num = month_date.year

        def month_sum(tx_type):
            q = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user.id,
                Transaction.type == tx_type,
                extract("month", Transaction.date) == month_num,
                extract("year", Transaction.date) == year_num
            )
            if date_from: q = q.filter(Transaction.date >= date_from)
            if date_to: q = q.filter(Transaction.date <= date_to)
            return q.scalar() or 0

        income = month_sum("income")
        expense = month_sum("expense")

        months.append({
            "month": month_date.strftime("%b %Y"),
            "income": round(income, 2),
            "expense": round(expense, 2),
            "savings": round(income - expense, 2)
        })

    return months


@router.get("/categories")
def get_categories(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    )
    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to: q = q.filter(Transaction.date <= date_to)

    results = q.group_by(Transaction.category).order_by(
        func.sum(Transaction.amount).desc()
    ).all()

    return [{"category": r.category, "total": round(r.total, 2)} for r in results]


@router.get("/balance-timeline")
def get_balance_timeline(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
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

        def month_sum(tx_type):
            q = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user.id,
                Transaction.type == tx_type,
                extract("month", Transaction.date) == month_num,
                extract("year", Transaction.date) == year_num
            )
            if date_from: q = q.filter(Transaction.date >= date_from)
            if date_to: q = q.filter(Transaction.date <= date_to)
            return q.scalar() or 0

        income = month_sum("income")
        expense = month_sum("expense")
        running_balance += income - expense

        months.append({
            "month": month_date.strftime("%b %Y"),
            "balance": round(running_balance, 2)
        })

    return months
