from fastapi import APIRouter
from app.schemas.bp_schema import HypertensionRecordCreate, HypertensionPredictionResponse
from pathlib import Path
import pandas as pd
import joblib
import json

router = APIRouter()

REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = REPO_ROOT / "Backend" / "models" / "Hypertension_model.pkl"
FEATURES_PATH = REPO_ROOT / "Backend" / "models" / "hypertension_features.pkl"
DATA_PATH = REPO_ROOT / "Dataset" / "Hypertension_dataset.csv"

model = joblib.load(str(MODEL_PATH))
features = joblib.load(str(FEATURES_PATH))
df = pd.read_csv(str(DATA_PATH))

def calculate_bmi(weight: float, height: float) -> float:
    if height and height > 0:
        return weight / ((height / 100) ** 2)
    return 0.0

def get_age_group(age: int) -> int:
    return (age // 5) + 1

if "age" in df.columns:
    df["age_group"] = df["age"].apply(get_age_group)
else:
    df["age_group"] = 0

def predict_high_risk(input_df: pd.DataFrame) -> float:
    probs = model.predict_proba(input_df)
    return float(probs[:, 1][0])

def calculate_risk_score(record: HypertensionRecordCreate) -> int:
    score = 0
    systolic = getattr(record, "sys_bp", 0) or 0
    diastolic = getattr(record, "dia_bp", 0) or 0
    if systolic and diastolic:
        if systolic > 140 or diastolic > 90:
            score += 2
        elif systolic > 120 or diastolic > 80:
            score += 1
    bmi = calculate_bmi(getattr(record, "weight", 0) or 0, getattr(record, "height", 0) or 0)
    if bmi >= 30:
        score += 2
    elif bmi >= 25:
        score += 1
    if getattr(record, "smoker", 0) == 1:
        score += 2
    if getattr(record, "salt_intake", 0) == 2:
        score += 1
    if getattr(record, "phys_activity", 1) == 0:
        score += 1
    stress_val = getattr(record, "stress", None)
    alcohol_val = getattr(record, "alcohol", None)
    notes = getattr(record, "notes", None)
    if notes:
        try:
            parsed = json.loads(notes)
            if stress_val is None:
                stress_val = parsed.get("stress")
            if alcohol_val is None:
                alcohol_val = parsed.get("alcohol")
        except Exception:
            pass
    if isinstance(stress_val, str) and stress_val.lower() == "high":
        score += 1
    if isinstance(alcohol_val, str) and alcohol_val.lower() == "high":
        score += 1
    family_history = getattr(record, "family_history_bp", 0)
    if family_history == 1:
        score += 1
    meds = getattr(record, "bp_meds", 0)
    if meds == 1:
        score += 2
    return score

def classify_final_risk(probability: float, risk_score: int) -> str:
    combined = (probability * 0.7) + (risk_score * 10 * 0.3)
    if combined < 25:
        return "Low"
    elif combined < 40:
        return "Moderate"
    elif combined < 55:
        return "Medium-High"
    else:
        return "High"

def get_dynamic_avg_group_prob(age: int) -> float:
    age_group = get_age_group(age)
    if "age_group" not in df.columns:
        return float(df["Risk"].mean()) if "Risk" in df.columns else 0.0
    group_df = df[df["age_group"] == age_group]
    if group_df.empty:
        return float(df["Risk"].mean()) if "Risk" in df.columns else 0.0
    return float(group_df["Risk"].mean()) if "Risk" in group_df.columns else 0.0

@router.post("/predict_bp", response_model=HypertensionPredictionResponse)
def predict_hypertension(record: HypertensionRecordCreate):
    bmi = calculate_bmi(record.weight, record.height)
    record_dict = record.dict(by_alias=True)
    input_data = {f: record_dict.get(f, 0) for f in features}
    if "BMI" in input_data:
        input_data["BMI"] = bmi
    input_df = pd.DataFrame([input_data])
    probability = predict_high_risk(input_df)
    risk_score = calculate_risk_score(record)
    risk_level = classify_final_risk(probability * 100, risk_score)
    avg_group_prob = get_dynamic_avg_group_prob(record.age)
    difference = (probability * 100) - (avg_group_prob * 100)
    return HypertensionPredictionResponse(
        probability=round(probability * 100, 2),
        risk_level=risk_level,
        avg_group_probability=round(avg_group_prob * 100, 2),
        difference=round(difference, 2)
    )
