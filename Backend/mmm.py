import pandas as pd
from app.schemas.heart_schema import HeartRecordCreate
from app.routes import predict_heart

# 3 حالات تجريبية
test_cases = [
    HeartRecordCreate(male=0, age=50, education=3, currentSmoker=1, cigsPerDay=10,
                      BPMeds=0, prevalentStroke=0, prevalentHyp=1, diabetes=0,
                      totChol=220, sysBP=140, diaBP=90, BMI=28, heartRate=80,
                      glucose=100),
    HeartRecordCreate(male=1, age=60, education=2, currentSmoker=0, cigsPerDay=0,
                      BPMeds=1, prevalentStroke=0, prevalentHyp=1, diabetes=1,
                      totChol=250, sysBP=150, diaBP=95, BMI=32, heartRate=85,
                      glucose=110),
    HeartRecordCreate(male=0, age=45, education=4, currentSmoker=0, cigsPerDay=0,
                      BPMeds=0, prevalentStroke=0, prevalentHyp=0, diabetes=0,
                      totChol=180, sysBP=120, diaBP=80, BMI=25, heartRate=72,
                      glucose=90)
]

results = []

for case in test_cases:
    response = predict_heart.predict_heart(case)
    results.append({
        "probability": response.probability,
        "avg_group_probability": response.avg_group_probability,
        "difference": response.difference,
        "risk_level": response.risk_level
    })

df_results = pd.DataFrame(results)
print(df_results)

# تحليلي توزيعي لل-difference
import seaborn as sns
import matplotlib.pyplot as plt

df_analysis = pd.read_csv("C:/Users/youse/OneDrive/Desktop/chronic-disease-risk/Dataset/Heart_data_cleaned.csv")
from app.routes.predict_heart import get_age_group, predict_high_risk, AGE_GROUP_AVGS

df_analysis['age_group'] = df_analysis['age'].apply(get_age_group)
df_analysis['probability'] = df_analysis.apply(
    lambda row: predict_high_risk(pd.DataFrame([{
        f: row[f] for f in df_analysis.columns if f != 'TenYearCHD'
    }])),
    axis=1
)
df_analysis['avg_group_probability'] = df_analysis['age_group'].apply(lambda x: AGE_GROUP_AVGS.get(x, 0.1))
df_analysis['difference'] = df_analysis['probability'] - df_analysis['avg_group_probability']

sns.histplot(data=df_analysis, x='difference', hue='TenYearCHD', bins=20, kde=True)
plt.title("Distribution of Differences by TenYearCHD")
plt.show()
