from fastapi import APIRouter
from app.schemas.diabetes_schema import DiabetesRecordCreate, DiabetesPredictionResponse
import pandas as pd
import joblib

router = APIRouter()

model_data = joblib.load("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/Diabetes_XGB_model.pkl")
model = model_data["model"]
features = model_data["features"]
low_th = model_data.get("low_th", 0.3)
mid_th = model_data.get("mid_th", 0.6)

AGE_GROUP_AVGS = {
    1: 0.05, 2: 0.07, 3: 0.10, 4: 0.12,
    5: 0.15, 6: 0.25, 7: 0.30, 8: 0.35,
    9: 0.40, 10: 0.45, 11: 0.50, 12: 0.55, 13: 0.60
}

def get_age_group(age: int) -> int:
    if age < 18: return 1
    elif age <= 24: return 1
    elif age <= 29: return 2
    elif age <= 34: return 3
    elif age <= 39: return 4
    elif age <= 44: return 5
    elif age <= 49: return 6
    elif age <= 54: return 7
    elif age <= 59: return 8
    elif age <= 64: return 9
    elif age <= 69: return 10
    elif age <= 74: return 11
    elif age <= 79: return 12
    else: return 13

def predict_high_risk(input_df: pd.DataFrame) -> float:
    return model.predict_proba(input_df)[:, 1][0]

def get_risk_level(probability, avg_group_probability):
    difference = probability - avg_group_probability
    if difference < 0.05:
        return "Low"
    elif difference < 0.2:
        return "Moderate"
    else:
        return "High"

@router.post("/predict/diabetes", response_model=DiabetesPredictionResponse)
def predict_diabetes(record: DiabetesRecordCreate):
    bmi = record.weight / ((record.height / 100) ** 2)

    input_data = {}
    for f in features:
        if f == "BMI":
            input_data[f] = bmi
        else:
            input_data[f] = getattr(record, f, 0)

    input_df = pd.DataFrame([input_data])

    probability = predict_high_risk(input_df)
    age_group = get_age_group(record.age)
    avg_group_prob = AGE_GROUP_AVGS.get(age_group, 0.2)
    difference = probability - avg_group_prob
    risk_level = get_risk_level(probability, avg_group_prob)

    return DiabetesPredictionResponse(
        probability=round(probability * 100, 2),
        risk_level=risk_level,
        avg_group_probability=round(avg_group_prob * 100, 2),
        difference=round(difference * 100, 2)
    )
