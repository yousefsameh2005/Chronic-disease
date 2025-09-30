from pydantic import BaseModel
from typing import Optional

class DiabetesRecordCreate(BaseModel):
    weight: float
    height: float
    age: int
    glucose: float
    HbA1c: float
    HighBP: int
    HighChol: int
    HeartDiseaseorAttack: int
    Stroke: int

    PhysActivity: int
    DiffWalk: int
    Smoker: int
    DietQuality: Optional[int] = 0
    HvyAlcoholConsump: Optional[int] = 0
    CholCheck: Optional[int] = 0
    frequent_urination: Optional[int] = 0
    excessive_thirst: Optional[int] = 0
    blurred_vision: Optional[int] = 0
    fatigue: Optional[int] = 0
    takes_medication: Optional[int] = 0

    FamilyHistoryDiabetes: int
    PreDiabetesDiagnosis: int
    GenHlth: int

    notes: Optional[str] = None

class DiabetesPredictionResponse(BaseModel):
    probability: float
    risk_level: str
    avg_group_probability: float
    difference: float
