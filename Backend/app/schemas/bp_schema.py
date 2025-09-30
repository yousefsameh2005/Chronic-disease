from pydantic import BaseModel, Field
from typing import Optional

class HypertensionRecordCreate(BaseModel):
    age: int
    weight: float
    height: float
    glucose: float
    male: int
    sys_bp: float = Field(..., alias="sysBP")
    dia_bp: float = Field(..., alias="diaBP")
    phys_activity: int = Field(..., alias="physicalActivity")
    diet_quality: int = Field(..., alias="DietQuality")
    smoker: int = Field(..., alias="currentSmoker")
    cigs_per_day: Optional[int] = Field(None, alias="cigsPerDay")
    salt_intake: int = Field(..., alias="SaltIntake")
    family_history_bp: int = Field(..., alias="FamilyHistoryBP")
    bp_meds: int = Field(..., alias="BPMeds")
    diabetes: int
    tot_chol: float = Field(..., alias="totChol")
    heart_rate: float = Field(..., alias="heartRate")
    notes: Optional[str] = None

    class Config:
        allow_population_by_field_name = True

class HypertensionPredictionResponse(BaseModel):
    probability: float
    risk_level: str
    avg_group_probability: float
    difference: float
