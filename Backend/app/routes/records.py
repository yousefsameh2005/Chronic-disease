from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.models.user_model import User

router = APIRouter(
    prefix="/records",
    tags=["records"]
)

@router.get("/users")
async def get_all_users():
    users = User.get_all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "phone": user.phone,
            "email": user.email
        })
    return JSONResponse(status_code=200, content={"status": "success", "data": result})

@router.post("/users")
async def add_user(user: dict):
    new_user = User(
        full_name=user.get("full_name"),
        phone=user.get("phone"),
        email=user.get("email"),
        password=user.get("password")
    )
    new_user.save()
    return JSONResponse(status_code=201, content={"status": "success", "data": {"user_id": new_user.id}})
