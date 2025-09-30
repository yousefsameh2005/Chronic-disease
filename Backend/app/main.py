from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# استيراد الرواتر
from app.routes import auth, predict_bp

app = FastAPI(
    title="Chronic Disease Risk API",
    description="API to predict hypertension risk using AI model",
    version="1.0"
)

# إعدادات CORS عشان الفورنت يقدر يبعت requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ممكن تغير "*" للعنوان الحقيقي للفورنت
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth")        # أي endpoints لل authentication
app.include_router(predict_bp.router, prefix="/predict")  # أي endpoints للـ hypertension prediction
