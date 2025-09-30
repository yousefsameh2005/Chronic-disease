import pandas as pd
import joblib

model = joblib.load("Hypertension_model.pkl")
features = joblib.load("features.pkl")

def predict_user_risk(user_data: dict) -> float:
    """
    user_data: dict containing user input data
    return: probability of high risk
    """
    user_df = pd.DataFrame([user_data], columns=features)
    prob = model.predict_proba(user_df)[:, 1][0]
    return prob

if __name__ == "__main__":
    sample_user = {
        'male': 1,
        'age': 50,
        'currentSmoker': 1,
        'cigsPerDay': 20,
        'BPMeds': 0,
        'diabetes': 1,
        'totChol': 250,
        'sysBP': 145,
        'diaBP': 95,
        'BMI': 30.2,
        'heartRate': 80,
        'glucose': 110
    }
    risk = predict_user_risk(sample_user)
    print(f"Predicted risk probability: {risk*100:.2f}%")
