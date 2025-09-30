import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from collections import Counter
import joblib
import warnings
warnings.filterwarnings('ignore')

df = pd.read_csv(r"C:\Users\youse\OneDrive\Desktop\chronic-disease-risk\Dataset\diabetes_dataset_cleaned.csv")

x = df.drop("Diabetes_012", axis=1)
y = df["Diabetes_012"]
y_binary = y.copy()
y_binary[y_binary != 0] = 1

x_train, x_test, y_train, y_test = train_test_split(
    x, y_binary, test_size=0.2, random_state=42
)

smote = SMOTE(sampling_strategy='auto', random_state=42)
x_train_res, y_train_res = smote.fit_resample(x_train, y_train)
print("After SMOTE:", Counter(y_train_res))

xgb_final = XGBClassifier(
    n_estimators=300,
    max_depth=12,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric='logloss',
    random_state=42
)
xgb_final.fit(x_train_res, y_train_res)

y_prob = xgb_final.predict_proba(x_test)[:, 1]
print(classification_report(y_test, xgb_final.predict(x_test)))
print("Confusion Matrix:\n", confusion_matrix(y_test, xgb_final.predict(x_test)))
print("\nFinal XGBoost model trained and evaluated")

low_th = 0.10
mid_th = 0.55
print("Low/Moderate cutoff:", low_th)
print("Moderate/High cutoff:", mid_th)

def predict_high_risk(model, input_df):
    return model.predict_proba(input_df)[:, 1]

def get_risk_level(prob, low_th, mid_th):
    if prob < low_th:
        return "Low"
    elif prob < mid_th:
        return "Moderate"
    else:
        return "High"

for p in [0.05, 0.2, 0.4, 0.7, 0.9]:
    print(p, "->", get_risk_level(p, low_th, mid_th))

joblib.dump({
    "model": xgb_final,
    "low_th": low_th,
    "mid_th": mid_th,
    "features": x.columns.tolist()
}, "C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Backend/models/Diabetes_XGB_model.pkl")

#