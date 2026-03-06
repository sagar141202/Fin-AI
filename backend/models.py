from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship — lets you do user.transactions later
    transactions = relationship("Transaction", back_populates="owner")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)   # Food, Rent, Salary etc.
    merchant = Column(String, nullable=True)     # Tesco, Netflix, Amazon
    description = Column(String, nullable=True)
    type = Column(String, nullable=False)        # "income" or "expense"
    date = Column(DateTime(timezone=True), server_default=func.now())
    is_anomaly = Column(Boolean, default=False)  # ML will set this later

    # Relationship back to user
    owner = relationship("User", back_populates="transactions")
