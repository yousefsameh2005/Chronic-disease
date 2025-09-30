from pydantic import BaseModel
from typing import Optional

class HeartRecordCreate(BaseModel):
    bloodPressureSys: float
    bloodPressureDia: float
    cholesterolTotal: float
    hdl: float
    ldl: float
    physicalActivity: str
    diet: str
    smoking: str
    stress: str
    familyHistory: str
    age: int
    gender: str
    weight: float
    height: float
    heartConditions: str
    notes: Optional[str] = None

class HeartPredictionResponse(BaseModel):
    probability: float
    risk_level: str
    avg_group_probability: float
    difference: float
