from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Transaction Schemas ---
class TransactionCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    type: str  # "income" or "expense"

class TransactionResponse(TransactionCreate):
    id: int
    user_id: int
    date: datetime
    is_anomaly: bool

    class Config:
        from_attributes = True