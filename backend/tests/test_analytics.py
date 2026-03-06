import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def get_token():
    client.post("/auth/register", json={
        "email": "analytics@example.com",
        "username": "analyticsuser",
        "password": "TestPass123"
    })
    response = client.post("/auth/login", json={
        "email": "analytics@example.com",
        "password": "TestPass123"
    })
    return response.json().get("access_token")


def test_summary_endpoint():
    token = get_token()
    response = client.get("/analytics/summary", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data
    assert "monthly_income" in data
    assert "monthly_expense" in data
    assert "savings_rate" in data


def test_monthly_endpoint():
    token = get_token()
    response = client.get("/analytics/monthly", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 12


def test_categories_endpoint():
    token = get_token()
    response = client.get("/analytics/categories", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_balance_timeline_endpoint():
    token = get_token()
    response = client.get("/analytics/balance-timeline", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 12
