import pandas as pd
import joblib

# Load the trained model, features, and scaler
model = joblib.load("Heart_model.pkl")
features = joblib.load("Heart_features.pkl")
scaler = joblib.load("Heart_scaler.pkl")

def predict_heart_risk(user_data: dict) -> float:
    """
    Predict probability of 10-year CHD (heart disease) risk.
    
    Parameters:
        user_data (dict): keys should match features in the trained model.
        
    Returns:
        float: predicted risk probability (0-1)
    """
    # Convert user input to DataFrame
    user_df = pd.DataFrame([user_data], columns=features)
    
    # Scale the input using the trained scaler
    user_df_scaled = pd.DataFrame(scaler.transform(user_df), columns=features)
    
    # Predict probability for class 1 (having disease)
    prob = model.predict_proba(user_df_scaled)[:, 1][0]
    return prob

# Example usage
if __name__ == "__main__":
    sample_user = {
        'male': 0,
        'age': 50,
        'currentSmoker': 1,
        'cigsPerDay': 20,
        'BPMeds': 0,
        'prevalentStroke': 0,
        'prevalentHyp': 1,
        'diabetes': 1,
        'totChol': 250,
        'sysBP': 145,
        'diaBP': 95,
        'BMI': 31,
        'heartRate': 80,
        'glucose': 110,
        'education': 3
    }
    
    risk = predict_heart_risk(sample_user)
    print(f"Predicted heart disease risk probability: {risk*100:.2f}%")
