import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

logger = logging.getLogger("uvicorn.error")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:219766@localhost:5432/resume_db")

# Ensure clean connection parameters; fallback gracefully to SQLite if PostgreSQL is unreachable
try:
    if DATABASE_URL.startswith("postgresql"):
        # Test connection quickly
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as connection:
            pass
        print(f"Connected to PostgreSQL database: {DATABASE_URL}")
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
except Exception as e:
    print(f"PostgreSQL connection warning ({e}). Falling back to local SQLite database.")
    DATABASE_URL = "sqlite:///./resume.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()