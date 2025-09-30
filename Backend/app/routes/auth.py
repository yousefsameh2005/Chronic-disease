from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password, create_access_token
from sqlalchemy.exc import IntegrityError
import logging

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/register")
async def register(user: UserCreate):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="كلمتا المرور غير متطابقتين")

    existing_user = User.get_by_email(user.email.strip())
    if existing_user:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مستخدم بالفعل")

    hashed_pwd = hash_password(user.password.strip())

    new_user = User(
        full_name=user.full_name.strip(),
        phone=user.phone.strip() if user.phone else None,
        email=user.email.strip(),
        password=hashed_pwd
    )

    try:
        new_user.save()
    except IntegrityError as ie:
        logging.exception("DB IntegrityError on user.save()")
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "detail": "فشل حفظ المستخدم في قاعدة البيانات. راجع قيم الإدخال.",
                "db_error": str(ie.__cause__)
            }
        )
    except Exception as e:
        logging.exception("Unexpected error on user.save()")
        raise HTTPException(status_code=500, detail="خطأ داخلي في الخادم أثناء التسجيل")

    return JSONResponse(
        status_code=201,
        content={
            "status": "success",
            "data": {"user_id": new_user.id},
            "message": "تم تسجيل المستخدم بنجاح"
        }
    )

@router.options("/register")
async def options_register():
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(content={}, headers=headers)

@router.post("/login")
async def login(user: UserLogin):
    existing_user = User.get_by_email(user.email.strip())
    if not existing_user:
        raise HTTPException(status_code=401, detail="البريد الإلكتروني أو كلمة المرور غير صحيحة")

    if not verify_password(user.password.strip(), existing_user.password):
        raise HTTPException(status_code=401, detail="البريد الإلكتروني أو كلمة المرور غير صحيحة")

    token = create_access_token({"user_id": existing_user.id})

    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "data": {"token": token},
            "message": "تم تسجيل الدخول بنجاح"
        }
    )

@router.options("/login")
async def options_login():
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(content={}, headers=headers)
