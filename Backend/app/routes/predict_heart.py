from fastapi import APIRouter
from app.schemas.heart_schema import HeartRecordCreate, HeartPredictionResponse
import pandas as pd
import joblib

router = APIRouter()

model = joblib.load("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/Heart_model.pkl")
features = joblib.load("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/Heart_features.pkl")
scaler = joblib.load("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/Heart_scaler.pkl")

df = pd.read_csv("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Dataset/Heart_data_cleaned.csv")

def calculate_bmi(weight, height):
    if height > 0:
        return weight / ((height / 100) ** 2)
    return 0

def predict_high_risk(input_df: pd.DataFrame) -> float:
    input_scaled = scaler.transform(input_df)
    return model.predict_proba(input_scaled)[:, 1][0]

def calculate_risk_score(record):
    score = 0
    if record.sysBP > 140 or record.diaBP > 90:
        score += 2
    elif record.sysBP > 120 or record.diaBP > 80:
        score += 1
    if record.totChol > 240:
        score += 2
    elif record.totChol > 200:
        score += 1
    if record.diabetes == 1:
        score += 2
    if record.currentSmoker == 1:
        score += 2
    bmi = calculate_bmi(record.weight, record.height)
    if bmi >= 30:
        score += 2
    elif bmi >= 25:
        score += 1
    return score

def classify_final_risk(probability, risk_score):
    combined = (probability * 0.7) + (risk_score * 10 * 0.3)
    if combined < 30:
        return "Low"
    elif combined < 50:
        return "Moderate"
    elif combined < 70:
        return "Medium-High"
    else:
        return "High"

@router.post("/predict/heart", response_model=HeartPredictionResponse)
def predict_heart(record: HeartRecordCreate):
    bmi = calculate_bmi(record.weight, record.height)
    input_data = {}
    for f in features:
        if f == "BMI":
            input_data[f] = bmi
        else:
            input_data[f] = getattr(record, f, 0)
    input_df = pd.DataFrame([input_data])
    probability = predict_high_risk(input_df)
    risk_score = calculate_risk_score(record)
    risk_level = classify_final_risk(probability * 100, risk_score)
    avg_group_prob = df[df["age"] == record.age]["TenYearCHD"].mean()
    if pd.isna(avg_group_prob):
        avg_group_prob = df["TenYearCHD"].mean()
    difference = (probability * 100) - (avg_group_prob * 100)
    return HeartPredictionResponse(
        probability=round(probability * 100, 2),
        risk_level=risk_level,
        avg_group_probability=round(avg_group_prob * 100, 2),
        difference=round(difference, 2)
    )
