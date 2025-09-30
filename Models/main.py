import pandas as pd
import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from scipy.stats import pointbiserialr, chi2_contingency
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier



data = pd.read_csv("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Dataset/Heart data new.csv")

# Cleaning Data
print(data.head())
print(data.info())
print(data.isnull().sum())

numeric_cols = ['education', 'cigsPerDay', 'BPMeds', 'totChol', 'BMI', 'heartRate', 'glucose']

for col in numeric_cols:
    data[col].fillna(data[col].median(), inplace=True)

print("\nRemaining missing values after filling:")
print(data.isnull().sum())

duplicates = data.duplicated().sum()
print(f"\nNumber of duplicate rows: {duplicates}")
if duplicates > 0:
    data.drop_duplicates(inplace=True)
    print("Duplicates removed.")

print("\nFirst 5 rows after cleaning:")
print(data.head())

#EDA
sns.countplot(x='TenYearCHD', data=data)
plt.title('TenYearCHD Distribution')
plt.show()

print("Counts of TenYearCHD:\n", data['TenYearCHD'].value_counts())
print("\nPercentage distribution:\n", data['TenYearCHD'].value_counts(normalize=True)*100)

numeric_cols = ['age','cigsPerDay','totChol','sysBP','diaBP','BMI','heartRate','glucose']
categorical_cols = ['male','education','currentSmoker','BPMeds','prevalentStroke','prevalentHyp','diabetes']
all_cols = numeric_cols + categorical_cols + ['TenYearCHD']
target = 'TenYearCHD'

def cramers_v(x, y):
    confusion_matrix = pd.crosstab(x, y)
    chi2_val = chi2_contingency(confusion_matrix)[0]
    n = confusion_matrix.sum().sum()
    return np.sqrt(chi2_val / (n * (min(confusion_matrix.shape)-1)))

correlation_matrix = data.corr()

#Plotting the heatmap
plt.figure(figsize=(12, 10))
sns.heatmap(correlation_matrix, annot=True, cmap="coolwarm", fmt=".2f")
plt.title("Correlation Matrix of Heart Disease Risk Factors")
plt.show()

# Model Training
X = data.drop('TenYearCHD', axis=1)
y = data['TenYearCHD']

from imblearn.over_sampling import SMOTE
smote = SMOTE(random_state=42)
X_res, y_res = smote.fit_resample(X, y)

X_train, X_test, y_train, y_test = train_test_split(X_res, y_res, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [None, 5, 10],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

rf = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(rf, param_grid, cv=3, scoring='f1', n_jobs=-1)
grid_search.fit(X_train, y_train)

best_rf = grid_search.best_estimator_

# Evaluate model
y_pred = best_rf.predict(X_test)
print("Best Params:", grid_search.best_params_)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# Save model, features, and scaler
joblib.dump(best_rf, "Heart_model.pkl")
joblib.dump(X.columns.tolist(), "Heart_features.pkl")
joblib.dump(scaler, "Heart_scaler.pkl")

print("Model, features, and scaler saved successfully")
