from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.database import db
from app.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_current_user
)

router = APIRouter()

class LoginSchema(BaseModel):
    email: str
    password: str

class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "user"
    phone: Optional[str] = ""
    language: Optional[str] = "en"

@router.post("/login")
async def login(credentials: LoginSchema):
    user = None
    try:
        user = await db.users.find_one({"email": credentials.email.lower()})
    except Exception as err:
        print("DB connection skipped in login:", err)

    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user.get("_id", user.get("id")))
    token = create_access_token({"sub": user_id, "email": user["email"], "role": user.get("role", "user")})

    user_dict = {
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "phone": user.get("phone", ""),
        "language": user.get("language", "en"),
        "avatar": user.get("avatar", f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.get('name')}"),
        "points": user.get("points", 0),
        "level": user.get("level", 1),
        "totalRecycled": user.get("totalRecycled", 0),
        "co2Saved": user.get("co2Saved", 0),
        "joinedDate": user.get("joinedDate", datetime.utcnow().strftime("%Y-%m-%d")),
        "badges": user.get("badges", []),
        "emailVerified": user.get("emailVerified", True),
        "phoneVerified": user.get("phoneVerified", True)
    }

    return {
        "token": token,
        "user": user_dict,
        "data": {
            "token": token,
            "user": user_dict
        }
    }

@router.post("/register")
async def register(userData: RegisterSchema):
    try:
        existing = await db.users.find_one({"email": userData.email.lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
    except HTTPException:
        raise
    except Exception as err:
        print("DB check skipped in register:", err)

    new_id = f"user-{int(datetime.utcnow().timestamp() * 1000)}"
    user_record = {
        "id": new_id,
        "name": userData.name,
        "email": userData.email.lower(),
        "password": hash_password(userData.password),
        "role": userData.role or "user",
        "phone": userData.phone or "",
        "language": userData.language or "en",
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={userData.name}",
        "points": 0,
        "level": 1,
        "totalRecycled": 0.0,
        "co2Saved": 0.0,
        "joinedDate": datetime.utcnow().strftime("%Y-%m-%d"),
        "badges": [],
        "emailVerified": True,
        "phoneVerified": True,
        "createdAt": datetime.utcnow()
    }

    try:
        inserted = await db.users.insert_one(user_record)
        user_record["id"] = str(inserted.inserted_id)
        user_record["_id"] = str(inserted.inserted_id)
    except Exception as err:
        print("DB insert skipped in register:", err)
        user_record["_id"] = new_id

    token = create_access_token({"sub": user_record["id"], "email": user_record["email"], "role": user_record["role"]})

    # sanitize password out
    user_record.pop("password", None)

    return {
        "token": token,
        "user": user_record,
        "data": {
            "token": token,
            "user": user_record
        }
    }

@router.get("/me")
async def get_me(user = Depends(require_current_user)):
    user.pop("password", None)
    return {"data": user}

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

@router.post("/refresh")
async def refresh_token(user = Depends(require_current_user)):
    user_id = str(user.get("_id", user.get("id")))
    token = create_access_token({"sub": user_id, "email": user["email"], "role": user.get("role", "user")})
    return {"token": token, "data": {"token": token}}
