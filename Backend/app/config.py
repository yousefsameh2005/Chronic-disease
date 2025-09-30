import os
from dotenv import load_dotenv
import secrets

load_dotenv()

DATABASE_URL = "mssql+pyodbc://@localhost/ChronicDiseaseDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"

SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(64))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  
FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
