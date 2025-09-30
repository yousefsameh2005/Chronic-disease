from pydantic import BaseModel
from typing import Optional

class HeartRecordCreate(BaseModel):
    age: int
    male: int
    height: float
    weight: float
    totChol: float
    sysBP: float
    diaBP: float
    heartRate: float
    glucose: float
    education: int
    currentSmoker: int
    cigsPerDay: Optional[int] = None
    BPMeds: int
    prevalentStroke: int
    prevalentHyp: int
    diabetes: int
    activity_level: int
    diet_quality: int
    stress_level: int
    family_history: int
    previous_history: int
    notes: Optional[str] = None

class HeartPredictionResponse(BaseModel):
    probability: float
    risk_level: str
    avg_group_probability: float
    difference: float
