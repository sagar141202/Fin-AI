import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

# Use SQLite for testing (no PostgreSQL needed in CI)
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


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Fin-AI API is running ✅"}


def test_register_user():
    import time
    unique = str(int(time.time()))
    response = client.post("/auth/register", json={
        "email": f"test{unique}@example.com",
        "username": f"testuser{unique}",
        "password": "TestPass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "email" in data


def test_register_duplicate_user():
    # Register first time
    client.post("/auth/register", json={
        "email": "dup@example.com",
        "username": "dupuser",
        "password": "TestPass123"
    })
    # Register again - should fail
    response = client.post("/auth/register", json={
        "email": "dup@example.com",
        "username": "dupuser",
        "password": "TestPass123"
    })
    assert response.status_code == 400


def test_login_success():
    # Register first
    client.post("/auth/register", json={
        "email": "login@example.com",
        "username": "loginuser",
        "password": "TestPass123"
    })
    # Then login
    response = client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "TestPass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password():
    response = client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "WrongPassword"
    })
    assert response.status_code == 401


def test_login_nonexistent_user():
    response = client.post("/auth/login", json={
        "email": "nobody@example.com",
        "password": "TestPass123"
    })
    assert response.status_code == 401
