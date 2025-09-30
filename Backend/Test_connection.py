from sqlalchemy import create_engine
from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1")
        print("Connection OK:", result.fetchone())
except Exception as e:
    print("Connection failed:", e)

