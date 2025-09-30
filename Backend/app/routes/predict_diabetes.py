from fastapi import APIRouter
from app.schemas.diabetes_schema import DiabetesRecordCreate, DiabetesPredictionResponse
import pandas as pd
import joblib
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "Diabetes_XGB_model.pkl"
DATA_PATH = BASE_DIR.parent / "Dataset" / "Hypertension_dataset.csv"

model_data = joblib.load(MODEL_PATH)
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

def to_float(v):
    try:
        if v is None: return 0.0
        if isinstance(v, (int, float)): return float(v)
        s = str(v).strip()
        if s == "": return 0.0
        return float(s)
    except:
        return 0.0

def to_int(v):
    try:
        if v is None: return 0
        if isinstance(v, int): return v
        s = str(v).strip()
        if s == "": return 0
        return int(float(s))
    except:
        return 0

def map_exercise(v):
    m = {
        "يومياً": 2, "daily": 2, "أسبوعياً": 1, "weekly": 1,
        "نادراً": 0, "rarely": 0, "لا أمارس": 0, "none": 0
    }
    return m.get(str(v).strip(), 0)

def map_diet(v):
    m = {"صحي": 2, "good": 2, "عادي": 1, "average": 1, "غير صحي": 0, "poor": 0}
    return m.get(str(v).strip(), 0)

def map_smoking(v):
    s = str(v).strip()
    if s in ("نعم", "yes", "ي", "ن"): return 1
    return 0

def map_alcohol(v):
    s = str(v).strip()
    if s in ("نعم", "yes", "high", "moderate"): return 1
    return 0

def predict_high_risk(input_df: pd.DataFrame) -> float:
    return model.predict_proba(input_df)[:, 1][0]

@router.post("/predict_diabetes", response_model=DiabetesPredictionResponse)
def predict_diabetes(record: DiabetesRecordCreate):
    rd = record.dict()
    weight = to_float(rd.get("weight"))
    height = to_float(rd.get("height"))
    bmi = weight / ((height / 100) ** 2) if height > 0 else 0.0
    record_map = {k: v for k, v in rd.items()}

    def get_candidates(f):
        candidates = []
        candidates_map = {
            "glucose": ["glucose", "fastingGlucose", "fasting_glucose"],
            "HbA1c": ["HbA1c", "hba1c"],
            "totChol": ["totChol", "cholesterol", "cholesterolTotal"],
            "triglycerides": ["triglycerides"],
            "PhysActivity": ["PhysActivity", "exercise"],
            "DietQuality": ["DietQuality", "diet"],
            "Smoker": ["Smoker", "smoking"],
            "HvyAlcoholConsump": ["HvyAlcoholConsump", "alcohol"],
            "FamilyHistoryDiabetes": ["FamilyHistoryDiabetes", "familyHistory"],
            "PreDiabetesDiagnosis": ["PreDiabetesDiagnosis", "previousDiagnosis"],
            "age": ["age"],
            "weight": ["weight"],
            "height": ["height"]
        }
        return candidates_map.get(f, [f])

    input_data = {}
    for f in features:
        if f == "BMI":
            input_data[f] = bmi
            continue
        val = None
        if f in record_map:
            val = record_map.get(f)
        else:
            for cand in get_candidates(f):
                if cand in record_map:
                    val = record_map.get(cand)
                    break
            if val is None:
                for k in record_map:
                    if k.lower() == f.lower():
                        val = record_map.get(k)
                        break
        if f.lower() in ("physactivity", "phys_activity", "physicalactivity"):
            input_data[f] = map_exercise(val)
            continue
        if f.lower() in ("dietquality", "diet_quality", "diet"):
            input_data[f] = map_diet(val)
            continue
        if f.lower() in ("smoker", "currentsmoker", "smoking"):
            input_data[f] = map_smoking(val)
            continue
        if f.lower() in ("hvyalcoholconsump", "alcohol"):
            input_data[f] = map_alcohol(val)
            continue
        if isinstance(val, str):
            if val.strip() == "":
                val = None
        if isinstance(val, (int, float)) or (isinstance(val, str) and any(ch.isdigit() for ch in val)):
            input_data[f] = to_float(val)
        else:
            input_data[f] = to_int(val) if isinstance(val, (int,)) else 0

    input_df = pd.DataFrame([input_data])
    probability = predict_high_risk(input_df)
    age_val = to_int(record_map.get("age"))
    age_group = get_age_group(age_val)
    avg_group_prob = AGE_GROUP_AVGS.get(age_group, 0.2)
    difference = probability - avg_group_prob
    return DiabetesPredictionResponse(
        probability=round(probability * 100, 2),
        risk_level=("Low" if difference < 0.05 else "Moderate" if difference < 0.2 else "High"),
        avg_group_probability=round(avg_group_prob * 100, 2),
        difference=round(difference * 100, 2)
    )
