from fastapi import APIRouter
from app.schemas.bp_schema import HypertensionRecordCreate, HypertensionPredictionResponse
import pandas as pd
import joblib

router = APIRouter()

# تحميل الموديل والـ features
model = joblib.load("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/Hypertension_model.pkl")
features = joblib.load("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/hypertension_features.pkl")

# تحميل الداتا الأساسية
df = pd.read_csv("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Dataset/Hypertension_dataset.csv")

# دوال مساعدة
def calculate_bmi(weight: float, height: float) -> float:
    if height > 0:
        return weight / ((height / 100) ** 2)
    return 0

def get_age_group(age: int) -> int:
    return (age // 5) + 1

df['age_group'] = df['age'].apply(get_age_group)

def predict_high_risk(input_df: pd.DataFrame) -> float:
    return model.predict_proba(input_df)[:, 1][0]

def calculate_risk_score(record) -> int:
    score = 0
    if record.currentSystolic and record.currentDiastolic:
        if record.currentSystolic > 140 or record.currentDiastolic > 90:
            score += 2
        elif record.currentSystolic > 120 or record.currentDiastolic > 80:
            score += 1
    bmi = calculate_bmi(getattr(record, 'weight', 0), getattr(record, 'height', 0))
    if bmi >= 30:
        score += 2
    elif bmi >= 25:
        score += 1
    if getattr(record, 'smoking', 'no').lower() in ["yes", "current"]:
        score += 2
    if getattr(record, 'saltIntake', 'low').lower() == "high":
        score += 1
    if getattr(record, 'physicalActivity', 'medium').lower() == "low":
        score += 1
    if getattr(record, 'stress', 'low').lower() == "high":
        score += 1
    if getattr(record, 'alcohol', 'low').lower() == "high":
        score += 1
    if getattr(record, 'familyHistory', 'no').lower() == "yes":
        score += 1
    if getattr(record, 'medications', 'no').lower() == "yes":
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
    group_df = df[df['age_group'] == age_group]
    if group_df.empty:
        return df['Risk'].mean()
    return group_df['Risk'].mean()

# Endpoint
@router.post("/predict_bp", response_model=HypertensionPredictionResponse)
def predict_hypertension(record: HypertensionRecordCreate):
    bmi = calculate_bmi(record.weight, record.height)

    # تجهيز بيانات الموديل
    record_dict = record.dict(by_alias=True)  # <= مهم جدا
    input_data = {f: record_dict.get(f, 0) for f in features}
    if "BMI" in input_data:
        input_data["BMI"] = bmi

    input_df = pd.DataFrame([input_data])

    # حساب الاحتمال وscore والـ risk level
    probability = predict_high_risk(input_df)
    risk_score = calculate_risk_score(record)
    risk_level = classify_final_risk(probability * 100, risk_score)
    avg_group_prob = get_dynamic_avg_group_prob(record.age)
    difference = (probability * 100) - (avg_group_prob * 100)

    # اعادة response
    return HypertensionPredictionResponse(
        probability=round(probability * 100, 2),
        risk_level=risk_level,
        avg_group_probability=round(avg_group_prob * 100, 2),
        difference=round(difference, 2)
    )
