from pydantic import BaseModel
from typing import Optional

class DiabetesRecordCreate(BaseModel):
    fastingGlucose: float
    hba1c: float
    cholesterol: float
    triglycerides: float
    exercise: str
    diet: str
    smoking: str
    alcohol: Optional[str] = None
    familyHistory: str
    age: int
    gender: str
    weight: float
    height: float
    previousDiagnosis: Optional[str] = None
    disease: Optional[str] = None

    glucose: Optional[float] = None
    HbA1c: Optional[float] = None
    HighBP: Optional[int] = None
    HighChol: Optional[int] = None
    HeartDiseaseorAttack: Optional[int] = None
    Stroke: Optional[int] = None
    PhysActivity: Optional[int] = None
    DiffWalk: Optional[int] = None
    Smoker: Optional[int] = None
    DietQuality: Optional[int] = None
    HvyAlcoholConsump: Optional[int] = None
    CholCheck: Optional[int] = None
    frequent_urination: Optional[int] = None
    excessive_thirst: Optional[int] = None
    blurred_vision: Optional[int] = None
    fatigue: Optional[int] = None
    takes_medication: Optional[int] = None
    FamilyHistoryDiabetes: Optional[int] = None
    PreDiabetesDiagnosis: Optional[int] = None
    GenHlth: Optional[int] = None
    notes: Optional[str] = None

class DiabetesPredictionResponse(BaseModel):
    probability: float
    risk_level: str
    avg_group_probability: float
    difference: float
