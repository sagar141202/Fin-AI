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
        "email": "txtest@example.com",
        "username": "txuser",
        "password": "TestPass123"
    })
    response = client.post("/auth/login", json={
        "email": "txtest@example.com",
        "password": "TestPass123"
    })
    return response.json().get("access_token")


def test_get_transactions_unauthorized():
    response = client.get("/transactions")
    assert response.status_code == 401


def test_get_transactions_authorized():
    token = get_token()
    response = client.get("/transactions", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    assert "total" in data


def test_create_transaction():
    token = get_token()
    response = client.post("/transactions", json={
        "amount": 150.00,
        "category": "Food",
        "type": "expense",
        "merchant": "Zomato",
        "description": "Dinner",
        "date": "2026-01-15T19:00:00"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 150.00
    assert data["category"] == "Food"


def test_create_transaction_invalid():
    token = get_token()
    # Missing required fields should fail
    response = client.post("/transactions", json={
        "amount": 50
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 422


def test_delete_transaction():
    token = get_token()
    # Create first
    create_res = client.post("/transactions", json={
        "amount": 200.00,
        "category": "Shopping",
        "type": "expense",
        "date": "2026-01-15T10:00:00"
    }, headers={"Authorization": f"Bearer {token}"})
    tx_id = create_res.json()["id"]

    # Delete it
    delete_res = client.delete(f"/transactions/{tx_id}", headers={
        "Authorization": f"Bearer {token}"
    })
    assert delete_res.status_code == 200
