from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict_bp, predict_diabetes, predict_heart, auth

app = FastAPI(title="Chronic Disease Prediction API")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(predict_bp.router)
app.include_router(predict_diabetes.router)
app.include_router(predict_heart.router)
