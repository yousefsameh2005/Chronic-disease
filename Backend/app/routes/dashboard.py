from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def test_dashboard():
    return {"message": "Hello from dashboard route"}
