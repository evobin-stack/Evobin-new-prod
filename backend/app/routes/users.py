from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from app.database import db
from app.auth_utils import require_current_user
from bson import ObjectId

router = APIRouter()

class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None

@router.get("/profile")
async def get_profile(user = Depends(require_current_user)):
    user.pop("password", None)
    return {"data": user}

@router.put("/profile")
async def update_profile(data: ProfileUpdateSchema, user = Depends(require_current_user)):
    user_id = str(user.get("_id", user.get("id")))
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    try:
        if update_data:
            query_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
            await db.users.update_one(
                {"$or": [{"_id": query_id}, {"id": user_id}]},
                {"$set": update_data}
            )
            updated = await db.users.find_one({"$or": [{"_id": query_id}, {"id": user_id}]})
            if updated:
                updated["id"] = str(updated.get("_id", updated.get("id")))
                updated.pop("password", None)
                return {"data": updated}
    except Exception as err:
        print("DB update skipped in update_profile:", err)

    # Fallback to in-memory user update
    merged_user = {**user, **update_data}
    merged_user.pop("password", None)
    return {"data": merged_user}

@router.put("/settings/language")
async def update_language(body: dict, user = Depends(require_current_user)):
    user_id = str(user.get("_id", user.get("id")))
    language = body.get("language", "en")
    await db.users.update_one(
        {"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id},
        {"$set": {"language": language}}
    )
    return {"success": True, "message": "Language updated successfully"}

@router.get("/badges")
async def get_user_badges(user = Depends(require_current_user)):
    badges = user.get("badges", ["First Device", "Eco Warrior"])
    return {"data": badges}
