from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from app.config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

class DiabetesPrediction(Base):
    __tablename__ = "DiabetesPredictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    predicted_risk = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def save(self):
        session = SessionLocal()
        session.add(self)
        session.commit()
        session.refresh(self)
        session.close()

    @classmethod
    def get_by_user(cls, user_id: int):
        session = SessionLocal()
        records = session.query(cls).filter(cls.user_id == user_id).all()
        session.close()
        return records

class HeartPrediction(Base):
    __tablename__ = "HeartPredictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    predicted_risk = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def save(self):
        session = SessionLocal()
        session.add(self)
        session.commit()
        session.refresh(self)
        session.close()

    @classmethod
    def get_by_user(cls, user_id: int):
        session = SessionLocal()
        records = session.query(cls).filter(cls.user_id == user_id).all()
        session.close()
        return records

class BloodPressurePrediction(Base):
    __tablename__ = "BloodPressurePredictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    predicted_risk = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def save(self):
        session = SessionLocal()
        session.add(self)
        session.commit()
        session.refresh(self)
        session.close()

    @classmethod
    def get_by_user(cls, user_id: int):
        session = SessionLocal()
        records = session.query(cls).filter(cls.user_id == user_id).all()
        session.close()
        return records
