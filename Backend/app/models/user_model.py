from sqlalchemy import Column, Integer, String, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from app.config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(300), nullable=False)
    phone = Column(String(40), nullable=True)
    email = Column(String(300), unique=True, index=True, nullable=False)
    password = Column(String(510), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=text("GETDATE()"))

    @classmethod
    def get_by_email(cls, email: str):
        session = SessionLocal()
        try:
            return session.query(cls).filter(cls.email == email).first()
        finally:
            session.close()

    def save(self):
        session = SessionLocal()
        try:
            session.add(self)
            session.commit()
            session.refresh(self)
        finally:
            session.close()
