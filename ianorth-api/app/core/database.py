import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL or "sqlite" in DATABASE_URL:
    print("AVISO: O Docker não carregou o .env! Caindo para o SQLite local.")
    engine = create_engine("sqlite:///./ianorth_edge.db", connect_args={"check_same_thread": False})
else:
    print(f"--- CONECTANDO AO SQL SERVER: {DATABASE_URL} ---")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()