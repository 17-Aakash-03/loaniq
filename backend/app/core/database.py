from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import DateTime
from datetime import datetime, timezone
import os

DATABASE_URL = "sqlite:///./microloan.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class User(Base):
    __tablename__ = "users"
    id               = Column(Integer,  primary_key=True, index=True)
    name             = Column(String,   nullable=False)
    email            = Column(String,   unique=True, index=True, nullable=False)
    hashed_password  = Column(String,   nullable=False)
    role             = Column(String,   default="user", nullable=False)
    telegram_chat_id = Column(String,   nullable=True,  default=None)
    created_at       = Column(DateTime, default=utcnow)

class Application(Base):
    __tablename__ = "applications"
    id          = Column(Integer,  primary_key=True, index=True)
    user_id     = Column(Integer,  nullable=False)
    score       = Column(Integer,  nullable=False)
    risk_tier   = Column(String,   nullable=False)
    explanation = Column(Text,     nullable=False)
    tips        = Column(Text,     nullable=False)
    created_at  = Column(DateTime, default=utcnow)

class PasswordReset(Base):
    __tablename__ = "password_resets"
    id         = Column(Integer,  primary_key=True, index=True)
    email      = Column(String,   nullable=False, index=True)
    token      = Column(String,   nullable=False, unique=True)
    used       = Column(String,   default="false")
    created_at = Column(DateTime, default=utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()