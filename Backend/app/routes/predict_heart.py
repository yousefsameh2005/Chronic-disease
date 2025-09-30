from fastapi import APIRouter
from app.schemas.heart_schema import HeartRecordCreate, HeartPredictionResponse
import pandas as pd
import joblib
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "Heart_model.pkl"
FEATURES_PATH = BASE_DIR / "models" / "Heart_features.pkl"
SCALER_PATH = BASE_DIR / "models" / "Heart_scaler.pkl"
DATA_PATH = BASE_DIR.parent / "Dataset" / "Heart_data_cleaned.csv"

model = joblib.load(MODEL_PATH)
features = joblib.load(FEATURES_PATH)
scaler = joblib.load(SCALER_PATH)
df = pd.read_csv(DATA_PATH)

def calculate_bmi(weight, height):
    return weight / ((height / 100) ** 2) if height > 0 else 0

def map_physical_activity(level):
    mapping = {"low": 0, "moderate": 1, "high": 2}
    return mapping.get(level, 0)

def map_diet_quality(diet):
    mapping = {"poor": 0, "average": 1, "good": 2, "excellent": 3}
    return mapping.get(diet, 0)

def map_smoking(smoking):
    mapping = {"no": 0, "yes": 1, "former": 0}
    return mapping.get(smoking, 0)

def predict_high_risk(input_df: pd.DataFrame) -> float:
    input_scaled = scaler.transform(input_df)
    return model.predict_proba(input_scaled)[:, 1][0]

def calculate_risk_score(record):
    score = 0
    if record.bloodPressureSys > 140 or record.bloodPressureDia > 90:
        score += 2
    elif record.bloodPressureSys > 120 or record.bloodPressureDia > 80:
        score += 1
    if record.cholesterolTotal > 240:
        score += 2
    elif record.cholesterolTotal > 200:
        score += 1
    if map_smoking(record.smoking) == 1:
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

@router.post("/predict_heart", response_model=HeartPredictionResponse)
def predict_heart(record: HeartRecordCreate):
    bmi = calculate_bmi(record.weight, record.height)
    input_data = {}
    for f in features:
        if f == "BMI":
            input_data[f] = bmi
        elif f == "physicalActivity":
            input_data[f] = map_physical_activity(record.physicalActivity)
        elif f == "diet":
            input_data[f] = map_diet_quality(record.diet)
        elif f == "currentSmoker":
            input_data[f] = map_smoking(record.smoking)
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
