from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

class UserBase(BaseModel):
    full_name: str = Field(..., alias="fullName")
    phone: str
    email: EmailStr

    @field_validator("full_name")
    def validate_full_name(cls, v):
        if not (2 <= len(v) <= 150):
            raise ValueError("الاسم لازم يكون من 2 ل 150 حرف")
        return v

    @field_validator("phone")
    def validate_phone(cls, v):
        if not (7 <= len(v) <= 20):
            raise ValueError("رقم الهاتف لازم يكون من 7 ل 20 رقم")
        return v

    model_config = {"populate_by_name": True}

class UserCreate(UserBase):
    password: str
    confirm_password: str = Field(..., alias="confirmPassword")

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("كلمة المرور لازم تكون على الأقل 6 أحرف")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}
