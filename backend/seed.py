import random
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
from models import User, Transaction
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Realistic data pools ────────────────────────────────
EXPENSE_CATEGORIES = {
    "Food": ["Tesco", "Sainsbury's", "McDonald's", "Deliveroo", "Uber Eats", "Nando's", "Pret A Manger", "Costa Coffee", "Starbucks"],
    "Transport": ["TfL", "Uber", "National Rail", "BP Petrol", "Shell", "Trainline", "EasyJet"],
    "Housing": ["Landlord Rent", "British Gas", "Thames Water", "BT Broadband", "Council Tax"],
    "Entertainment": ["Netflix", "Spotify", "Amazon Prime", "Vue Cinema", "Steam", "Apple TV+"],
    "Shopping": ["Amazon", "ASOS", "Zara", "H&M", "Argos", "IKEA", "eBay"],
    "Health": ["Boots", "LloydsPharmacy", "Pure Gym", "Nuffield Health", "NHS Prescription"],
    "Education": ["Udemy", "Coursera", "Amazon Books", "University Fee"],
    "Utilities": ["EDF Energy", "Octopus Energy", "Three Mobile", "Sky TV"],
}

INCOME_CATEGORIES = {
    "Salary": ["Employer Direct Deposit", "HSBC Payroll", "Barclays Payroll"],
    "Freelance": ["Upwork Payment", "Fiverr Payout", "Client Payment"],
    "Investment": ["Dividend Payment", "Trading 212", "Vanguard Returns"],
    "Other": ["HMRC Tax Refund", "Bank Interest", "Gift Received"],
}

# Typical amounts per category
EXPENSE_AMOUNTS = {
    "Food": (5, 120),
    "Transport": (2, 200),
    "Housing": (800, 1500),
    "Entertainment": (5, 50),
    "Shopping": (15, 300),
    "Health": (10, 80),
    "Education": (15, 200),
    "Utilities": (30, 150),
}

INCOME_AMOUNTS = {
    "Salary": (2500, 4000),
    "Freelance": (200, 1500),
    "Investment": (50, 500),
    "Other": (20, 300),
}


def random_date(days_back=365):
    return datetime.utcnow() - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )


def seed():
    db = SessionLocal()

    # ─── Create demo user ────────────────────────────────
    existing = db.query(User).filter(User.email == "sagar@test.com").first()
    if existing:
        user = existing
        print("✅ User already exists, adding transactions...")
    else:
        user = User(
            email="sagar@test.com",
            username="sagar",
            hashed_password=pwd_context.hash("Test1234")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created user: {user.email}")

    # ─── Generate 500+ transactions ───────────────────────
    transactions = []

    # Regular monthly expenses (Housing, Utilities) — very consistent
    for month in range(12):
        date = datetime.utcnow() - timedelta(days=30 * month)

        # Rent every month
        transactions.append(Transaction(
            user_id=user.id,
            amount=round(random.uniform(1100, 1200), 2),
            category="Housing",
            merchant="Landlord Rent",
            description="Monthly rent",
            type="expense",
            date=date.replace(day=1)
        ))

        # Salary every month
        transactions.append(Transaction(
            user_id=user.id,
            amount=round(random.uniform(3000, 3200), 2),
            category="Salary",
            merchant="HSBC Payroll",
            description="Monthly salary",
            type="income",
            date=date.replace(day=28)
        ))

        # Utilities every month
        for merchant in ["EDF Energy", "Three Mobile", "BT Broadband"]:
            transactions.append(Transaction(
                user_id=user.id,
                amount=round(random.uniform(30, 120), 2),
                category="Utilities",
                merchant=merchant,
                description=f"{merchant} bill",
                type="expense",
                date=date.replace(day=random.randint(1, 10))
            ))

    # Random daily expenses (400+ transactions)
    for _ in range(420):
        is_expense = random.random() < 0.85  # 85% expenses, 15% income

        if is_expense:
            category = random.choice(list(EXPENSE_CATEGORIES.keys()))
            merchant = random.choice(EXPENSE_CATEGORIES[category])
            min_amt, max_amt = EXPENSE_AMOUNTS[category]
            amount = round(random.uniform(min_amt, max_amt), 2)
            tx_type = "expense"
        else:
            category = random.choice(list(INCOME_CATEGORIES.keys()))
            merchant = random.choice(INCOME_CATEGORIES[category])
            min_amt, max_amt = INCOME_AMOUNTS[category]
            amount = round(random.uniform(min_amt, max_amt), 2)
            tx_type = "income"

        transactions.append(Transaction(
            user_id=user.id,
            amount=amount,
            category=category,
            merchant=merchant,
            type=tx_type,
            date=random_date(365)
        ))

    # ─── Add 5 anomalies (unusually large amounts) ────────
    anomalies = [
        Transaction(user_id=user.id, amount=2500.00, category="Shopping",
                   merchant="Apple Store", type="expense",
                   date=random_date(30), is_anomaly=True),
        Transaction(user_id=user.id, amount=1800.00, category="Shopping",
                   merchant="Currys PC World", type="expense",
                   date=random_date(30), is_anomaly=True),
        Transaction(user_id=user.id, amount=3200.00, category="Transport",
                   merchant="EasyJet", type="expense",
                   date=random_date(60), is_anomaly=True),
        Transaction(user_id=user.id, amount=950.00, category="Entertainment",
                   merchant="Casino Royale", type="expense",
                   date=random_date(90), is_anomaly=True),
        Transaction(user_id=user.id, amount=5000.00, category="Other",
                   merchant="Unknown Merchant", type="expense",
                   date=random_date(90), is_anomaly=True),
    ]
    transactions.extend(anomalies)

    db.bulk_save_objects(transactions)
    db.commit()
    db.close()

    total = len(transactions)
    print(f"✅ Seeded {total} transactions successfully!")
    print(f"   • Regular transactions: {total - 5}")
    print(f"   • Anomalies injected: 5")


if __name__ == "__main__":
    seed()
import random
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
from models import User, Transaction
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Realistic data pools ────────────────────────────────
EXPENSE_CATEGORIES = {
    "Food": ["Tesco", "Sainsbury's", "McDonald's", "Deliveroo", "Uber Eats", "Nando's", "Pret A Manger", "Costa Coffee", "Starbucks"],
    "Transport": ["TfL", "Uber", "National Rail", "BP Petrol", "Shell", "Trainline", "EasyJet"],
    "Housing": ["Landlord Rent", "British Gas", "Thames Water", "BT Broadband", "Council Tax"],
    "Entertainment": ["Netflix", "Spotify", "Amazon Prime", "Vue Cinema", "Steam", "Apple TV+"],
    "Shopping": ["Amazon", "ASOS", "Zara", "H&M", "Argos", "IKEA", "eBay"],
    "Health": ["Boots", "LloydsPharmacy", "Pure Gym", "Nuffield Health", "NHS Prescription"],
    "Education": ["Udemy", "Coursera", "Amazon Books", "University Fee"],
    "Utilities": ["EDF Energy", "Octopus Energy", "Three Mobile", "Sky TV"],
}

INCOME_CATEGORIES = {
    "Salary": ["Employer Direct Deposit", "HSBC Payroll", "Barclays Payroll"],
    "Freelance": ["Upwork Payment", "Fiverr Payout", "Client Payment"],
    "Investment": ["Dividend Payment", "Trading 212", "Vanguard Returns"],
    "Other": ["HMRC Tax Refund", "Bank Interest", "Gift Received"],
}

# Typical amounts per category
EXPENSE_AMOUNTS = {
    "Food": (5, 120),
    "Transport": (2, 200),
    "Housing": (800, 1500),
    "Entertainment": (5, 50),
    "Shopping": (15, 300),
    "Health": (10, 80),
    "Education": (15, 200),
    "Utilities": (30, 150),
}

INCOME_AMOUNTS = {
    "Salary": (2500, 4000),
    "Freelance": (200, 1500),
    "Investment": (50, 500),
    "Other": (20, 300),
}


def random_date(days_back=365):
    return datetime.utcnow() - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )


def seed():
    db = SessionLocal()

    # ─── Create demo user ────────────────────────────────
    existing = db.query(User).filter(User.email == "sagar@test.com").first()
    if existing:
        user = existing
        print("✅ User already exists, adding transactions...")
    else:
        user = User(
            email="sagar@test.com",
            username="sagar",
            hashed_password=pwd_context.hash("Test1234")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created user: {user.email}")

    # ─── Generate 500+ transactions ───────────────────────
    transactions = []

    # Regular monthly expenses (Housing, Utilities) — very consistent
    for month in range(12):
        date = datetime.utcnow() - timedelta(days=30 * month)

        # Rent every month
        transactions.append(Transaction(
            user_id=user.id,
            amount=round(random.uniform(1100, 1200), 2),
            category="Housing",
            merchant="Landlord Rent",
            description="Monthly rent",
            type="expense",
            date=date.replace(day=1)
        ))

        # Salary every month
        transactions.append(Transaction(
            user_id=user.id,
            amount=round(random.uniform(3000, 3200), 2),
            category="Salary",
            merchant="HSBC Payroll",
            description="Monthly salary",
            type="income",
            date=date.replace(day=28)
        ))

        # Utilities every month
        for merchant in ["EDF Energy", "Three Mobile", "BT Broadband"]:
            transactions.append(Transaction(
                user_id=user.id,
                amount=round(random.uniform(30, 120), 2),
                category="Utilities",
                merchant=merchant,
                description=f"{merchant} bill",
                type="expense",
                date=date.replace(day=random.randint(1, 10))
            ))

    # Random daily expenses (400+ transactions)
    for _ in range(420):
        is_expense = random.random() < 0.85  # 85% expenses, 15% income

        if is_expense:
            category = random.choice(list(EXPENSE_CATEGORIES.keys()))
            merchant = random.choice(EXPENSE_CATEGORIES[category])
            min_amt, max_amt = EXPENSE_AMOUNTS[category]
            amount = round(random.uniform(min_amt, max_amt), 2)
            tx_type = "expense"
        else:
            category = random.choice(list(INCOME_CATEGORIES.keys()))
            merchant = random.choice(INCOME_CATEGORIES[category])
            min_amt, max_amt = INCOME_AMOUNTS[category]
            amount = round(random.uniform(min_amt, max_amt), 2)
            tx_type = "income"

        transactions.append(Transaction(
            user_id=user.id,
            amount=amount,
            category=category,
            merchant=merchant,
            type=tx_type,
            date=random_date(365)
        ))

    # ─── Add 5 anomalies (unusually large amounts) ────────
    anomalies = [
        Transaction(user_id=user.id, amount=2500.00, category="Shopping",
                   merchant="Apple Store", type="expense",
                   date=random_date(30), is_anomaly=True),
        Transaction(user_id=user.id, amount=1800.00, category="Shopping",
                   merchant="Currys PC World", type="expense",
                   date=random_date(30), is_anomaly=True),
        Transaction(user_id=user.id, amount=3200.00, category="Transport",
                   merchant="EasyJet", type="expense",
                   date=random_date(60), is_anomaly=True),
        Transaction(user_id=user.id, amount=950.00, category="Entertainment",
                   merchant="Casino Royale", type="expense",
                   date=random_date(90), is_anomaly=True),
        Transaction(user_id=user.id, amount=5000.00, category="Other",
                   merchant="Unknown Merchant", type="expense",
                   date=random_date(90), is_anomaly=True),
    ]
    transactions.extend(anomalies)

    db.bulk_save_objects(transactions)
    db.commit()
    db.close()

    total = len(transactions)
    print(f"✅ Seeded {total} transactions successfully!")
    print(f"   • Regular transactions: {total - 5}")
    print(f"   • Anomalies injected: 5")


if __name__ == "__main__":
    seed()
