from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from models import Transaction

NEEDS_CATEGORIES = ["Housing", "Utilities", "Food", "Transport", "Health"]
WANTS_CATEGORIES = ["Entertainment", "Shopping", "Education", "Other"]
SAVINGS_CATEGORIES = ["Investment", "Freelance"]

CATEGORY_BUDGETS_PERCENT = {
    "Housing": 30,
    "Food": 10,
    "Transport": 8,
    "Utilities": 7,
    "Entertainment": 8,
    "Shopping": 10,
    "Health": 5,
    "Education": 5,
    "Other": 5,
}


def get_current_month_spending(db: Session, user_id: int) -> dict:
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    results = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= month_start
    ).group_by(Transaction.category).all()

    return {r.category: float(r.total) for r in results}


def get_monthly_income(db: Session, user_id: int) -> float:
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= month_start
    ).scalar() or 0

    # If no income this month use last 3 months average
    if income == 0:
        three_months_ago = now - timedelta(days=90)
        income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.date >= three_months_ago
        ).scalar() or 0
        income = income / 3

    return float(income)


def get_last_month_spending(db: Session, user_id: int) -> dict:
    now = datetime.utcnow()
    last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
    last_month_end = now.replace(day=1)

    results = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= last_month_start,
        Transaction.date < last_month_end
    ).group_by(Transaction.category).all()

    return {r.category: float(r.total) for r in results}


def analyze_budget(db: Session, user_id: int) -> dict:
    spending = get_current_month_spending(db, user_id)
    income = get_monthly_income(db, user_id)
    last_month = get_last_month_spending(db, user_id)

    total_spend = sum(spending.values())

    # 50/30/20 analysis
    needs_spend = sum(spending.get(c, 0) for c in NEEDS_CATEGORIES)
    wants_spend = sum(spending.get(c, 0) for c in WANTS_CATEGORIES)
    savings_actual = income - total_spend

    needs_pct = (needs_spend / income * 100) if income > 0 else 0
    wants_pct = (wants_spend / income * 100) if income > 0 else 0
    savings_pct = (savings_actual / income * 100) if income > 0 else 0

    # Generate insights
    insights = []

    # 50/30/20 insights
    if needs_pct > 60:
        insights.append({
            "type": "warning",
            "title": "High Essential Spending",
            "message": f"You're spending {needs_pct:.0f}% of income on essentials. The recommended limit is 50%. Consider reducing housing or transport costs.",
            "icon": "⚠️"
        })
    elif needs_pct < 40:
        insights.append({
            "type": "success",
            "title": "Healthy Essential Spending",
            "message": f"Great job! Only {needs_pct:.0f}% of income goes to essentials, well within the 50% guideline.",
            "icon": "✅"
        })

    if wants_pct > 35:
        insights.append({
            "type": "warning",
            "title": "Wants Spending Too High",
            "message": f"You're spending {wants_pct:.0f}% on wants (Entertainment, Shopping). Try to keep this under 30%.",
            "icon": "⚠️"
        })

    if savings_pct < 10:
        insights.append({
            "type": "danger",
            "title": "Low Savings This Month",
            "message": f"You're only saving {max(0, savings_pct):.0f}% of income. Aim for at least 20% to build financial security.",
            "icon": "🚨"
        })
    elif savings_pct >= 20:
        insights.append({
            "type": "success",
            "title": "Excellent Savings Rate!",
            "message": f"You're saving {savings_pct:.0f}% of income this month — above the 20% target. Keep it up!",
            "icon": "🎉"
        })

    # Month-over-month comparisons
    for category, current in spending.items():
        prev = last_month.get(category, 0)
        if prev > 0:
            change_pct = (current - prev) / prev * 100
            if change_pct > 40 and current > 100:
                insights.append({
                    "type": "warning",
                    "title": f"Spike in {category} Spending",
                    "message": f"You spent {change_pct:.0f}% more on {category} this month (₹{current:,.0f} vs ₹{prev:,.0f} last month).",
                    "icon": "📈"
                })
            elif change_pct < -30 and prev > 100:
                insights.append({
                    "type": "success",
                    "title": f"Reduced {category} Spending",
                    "message": f"Well done! You cut {category} spending by {abs(change_pct):.0f}% compared to last month.",
                    "icon": "📉"
                })

    # Top spending category insight
    if spending:
        top_cat = max(spending, key=spending.get)
        top_pct = spending[top_cat] / total_spend * 100 if total_spend > 0 else 0
        if top_pct > 40:
            insights.append({
                "type": "info",
                "title": f"{top_cat} Dominates Your Spending",
                "message": f"{top_cat} accounts for {top_pct:.0f}% of your total spending this month (₹{spending[top_cat]:,.0f}).",
                "icon": "💡"
            })

    # Budget progress per category
    budget_progress = []
    for category, pct in CATEGORY_BUDGETS_PERCENT.items():
        budget_limit = income * pct / 100
        actual = spending.get(category, 0)
        used_pct = (actual / budget_limit * 100) if budget_limit > 0 else 0
        budget_progress.append({
            "category": category,
            "budget": round(budget_limit, 2),
            "spent": round(actual, 2),
            "used_percent": round(min(used_pct, 100), 1),
            "over_budget": actual > budget_limit,
            "remaining": round(max(0, budget_limit - actual), 2)
        })

    budget_progress.sort(key=lambda x: x["used_percent"], reverse=True)

    return {
        "income": round(income, 2),
        "total_spend": round(total_spend, 2),
        "savings": round(savings_actual, 2),
        "needs_percent": round(needs_pct, 1),
        "wants_percent": round(wants_pct, 1),
        "savings_percent": round(savings_pct, 1),
        "insights": insights[:5],
        "budget_progress": budget_progress,
        "rule_5030_20": {
            "needs": {"actual": round(needs_pct, 1), "target": 50, "status": "ok" if needs_pct <= 55 else "over"},
            "wants": {"actual": round(wants_pct, 1), "target": 30, "status": "ok" if wants_pct <= 35 else "over"},
            "savings": {"actual": round(max(0, savings_pct), 1), "target": 20, "status": "ok" if savings_pct >= 15 else "under"}
        }
    }
