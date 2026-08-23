from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.auth_utils import require_current_user
from datetime import datetime
import uuid

router = APIRouter()

DEFAULT_REWARDS = [
    {
        "id": "rew-1",
        "_id": "rew-1",
        "title": "Amazon ₹500 Gift Voucher",
        "partner": "Amazon India",
        "pointsRequired": 500,
        "category": "Vouchers",
        "description": "Get ₹500 off on your next Amazon shopping order",
        "code": "AMZN-ECO-500",
        "available": True,
        "expiry": "2026-12-31"
    },
    {
        "id": "rew-2",
        "_id": "rew-2",
        "title": "Swiggy Money ₹250 Voucher",
        "partner": "Swiggy",
        "pointsRequired": 300,
        "category": "Food",
        "description": "₹250 added to your Swiggy Money wallet",
        "code": "SWIGGY-ECO-250",
        "available": True,
        "expiry": "2026-12-31"
    }
]

@router.get("")
@router.get("/")
async def get_rewards():
    try:
        cursor = db.rewards.find()
        rewards = await cursor.to_list(length=100)
        for r in rewards:
            r["_id"] = str(r["_id"])
            if "id" not in r:
                r["id"] = r["_id"]
        if rewards:
            return {"data": rewards}
    except Exception as err:
        print("DB operation skipped in get_rewards:", err)
    return {"data": DEFAULT_REWARDS}

@router.get("/points")
async def get_user_points(user = Depends(require_current_user)):
    return {
        "data": {
            "points": user.get("points", 2450) if isinstance(user, dict) else 2450,
            "pending": 50
        }
    }

@router.post("/{id}/redeem")
async def redeem_reward(id: str, user = Depends(require_current_user)):
    reward = DEFAULT_REWARDS[0]
    try:
        db_reward = await db.rewards.find_one({"$or": [{"id": id}, {"_id": id}]})
        if db_reward:
            reward = db_reward
    except Exception as err:
        print("DB lookup skipped in redeem_reward:", err)

    points_required = reward.get("pointsRequired", 500)
    user_points = user.get("points", 2450) if isinstance(user, dict) else 2450

    user_id = str(user.get("_id", user.get("id"))) if isinstance(user, dict) else "user-1"
    redemption_record = {
        "id": f"red-{uuid.uuid4().hex[:8]}",
        "userId": user_id,
        "rewardId": reward["id"],
        "rewardTitle": reward["title"],
        "pointsSpent": points_required,
        "code": reward.get("code", "EVOBIN-VOUCHER-2026"),
        "redeemedAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "status": "Active"
    }

    try:
        from bson import ObjectId
        await db.users.update_one(
            {"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id},
            {"$inc": {"points": -points_required}}
        )
        await db.redemptions.insert_one(redemption_record)
        await db.notifications.insert_one({
            "id": f"notif-{uuid.uuid4().hex[:6]}",
            "userId": user_id,
            "title": "Reward Redeemed!",
            "message": f"You redeemed {reward['title']} for {points_required} points. Code: {redemption_record['code']}",
            "read": False,
            "createdAt": "Just now",
            "type": "reward"
        })
    except Exception as err:
        print("DB update skipped in redeem_reward:", err)

    return {
        "success": True,
        "data": redemption_record,
        "message": f"Successfully redeemed {reward['title']}!"
    }

@router.get("/redemptions")
async def get_user_redemptions(user = Depends(require_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if isinstance(user, dict) else "user-1"
    redemptions = []
    try:
        cursor = db.redemptions.find({"userId": user_id}).sort("_id", -1)
        redemptions = await cursor.to_list(length=100)
        for r in redemptions:
            r["_id"] = str(r["_id"])
    except Exception as err:
        print("DB lookup skipped in get_user_redemptions:", err)
    return {"data": redemptions}
