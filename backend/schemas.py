from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# ─── Auth Schemas ────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ─── Transaction Schemas ──────────────────────────────────
class TransactionCreate(BaseModel):
    amount: float
    category: str
    merchant: Optional[str] = None
    description: Optional[str] = None
    type: str                          # "income" or "expense"
    date: Optional[datetime] = None    # defaults to now if not provided

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    merchant: Optional[str]
    description: Optional[str]
    type: str
    date: datetime
    is_anomaly: bool
    model_config = {"from_attributes": True}

class TransactionListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    transactions: List[TransactionResponse]
