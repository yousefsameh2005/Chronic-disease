from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from app.config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

class DiabetesAssessment(Base):
    __tablename__ = "DiabetesAssessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    fasting_glucose = Column(Float, nullable=True)
    hba1c = Column(Float, nullable=True)
    cholesterol = Column(Float, nullable=True)
    triglycerides = Column(Float, nullable=True)
    exercise = Column(String(50), nullable=True)
    diet = Column(String(50), nullable=True)
    smoking = Column(String(50), nullable=True)
    alcohol = Column(String(50), nullable=True)
    family_history = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    previous_diagnosis = Column(String(100), nullable=True)
    risk_level = Column(String(50), nullable=True)
    risk_percentage = Column(Float, nullable=True)
    comparison = Column(Float, nullable=True)
    recommendations = Column(String, nullable=True)
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

class HeartAssessment(Base):
    __tablename__ = "HeartAssessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    blood_pressure_sys = Column(Float, nullable=True)
    blood_pressure_dia = Column(Float, nullable=True)
    cholesterol_total = Column(Float, nullable=True)
    hdl = Column(Float, nullable=True)
    ldl = Column(Float, nullable=True)
    physical_activity = Column(String(50), nullable=True)
    diet = Column(String(50), nullable=True)
    smoking = Column(String(50), nullable=True)
    stress = Column(String(50), nullable=True)
    family_history = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    heart_conditions = Column(String(100), nullable=True)
    risk_level = Column(String(50), nullable=True)
    risk_percentage = Column(Float, nullable=True)
    comparison = Column(Float, nullable=True)
    recommendations = Column(String, nullable=True)
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

class BloodPressureAssessment(Base):
    __tablename__ = "BloodPressureAssessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    current_systolic = Column(Float, nullable=True)
    current_diastolic = Column(Float, nullable=True)
    morning_reading = Column(Float, nullable=True)
    evening_reading = Column(Float, nullable=True)
    frequency_check = Column(String(50), nullable=True)
    salt_intake = Column(String(50), nullable=True)
    physical_activity = Column(String(50), nullable=True)
    stress = Column(String(50), nullable=True)
    smoking = Column(String(50), nullable=True)
    alcohol = Column(String(50), nullable=True)
    family_history = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    medications = Column(String(50), nullable=True)
    risk_level = Column(String(50), nullable=True)
    risk_percentage = Column(Float, nullable=True)
    comparison = Column(Float, nullable=True)
    recommendations = Column(String, nullable=True)
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
