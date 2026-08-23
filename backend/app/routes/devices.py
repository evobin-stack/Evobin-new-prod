from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.services.ai_service import analyze_device
from app.database import db
from app.auth_utils import get_current_user
from datetime import datetime
from bson import ObjectId
import uuid
import asyncio
from typing import Optional

router = APIRouter()

@router.post("/upload")
async def upload_device(
    image: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    user = Depends(get_current_user)
):
    try:
        image_bytes = await image.read()

        # AI analysis with YOLO model offloaded to thread pool (non-blocking)
        ai_result = await asyncio.to_thread(analyze_device, image_bytes)

        user_id = str(user.get("_id", user.get("id"))) if user else "guest"

        record = {
            "id": f"dev-{uuid.uuid4().hex[:8]}",
            "userId": user_id,
            "deviceType": ai_result["deviceType"],
            "confidence": ai_result["confidence"],
            "components": ai_result.get("components", []),
            "processed_image_url": ai_result.get("processed_image_url", ""),
            "notes": notes,
            "status": "Analyzed",
            "createdAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            "filename": image.filename
        }

        try:
            inserted = await db.device_analysis.insert_one(record)
            record["_id"] = str(inserted.inserted_id)
        except Exception as db_err:
            print("DB insert skipped (Offline/Disconnected):", db_err)
            record["_id"] = record["id"]

        return {
            "success": True,
            "data": {
                **ai_result,
                "id": record["id"],
                "_id": record["_id"]
            }
        }
    except Exception as e:
        print("Upload device error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/estimate-value")
async def estimate_value(details: dict):
    device_type = details.get("deviceType", "Smartphone")
    condition = details.get("condition", "Good")
    functional = details.get("functionalStatus", "Working")

    base_map = {
        "Laptop": 1500,
        "Smartphone": 800,
        "Television": 1200,
        "Monitor": 600,
        "Microwave": 400,
        "Printer": 300,
        "Keyboard": 100,
        "Mouse": 50,
        "Air Conditioner": 2000,
        "Refrigerator": 2500
    }
    base = base_map.get(device_type, 300)

    cond_multiplier = {"Excellent": 1.0, "Good": 0.75, "Fair": 0.5, "Poor": 0.25}.get(condition, 0.5)
    func_multiplier = {"Working": 1.0, "Partially Working": 0.6, "Not Working": 0.3}.get(functional, 0.5)

    money_value = int(base * cond_multiplier * func_multiplier)
    points_value = int(money_value * 1.5)

    return {
        "data": {
            "estimatedMoneyValue": money_value,
            "pointsValue": points_value,
            "marketValue": money_value
        }
    }

@router.post("/submit")
async def submit_device_recycling(payload: dict, user = Depends(get_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if user else "guest"
    tracking_id = f"EVO-{uuid.uuid4().hex[:6].upper()}"

    device_type = payload.get("deviceDetails", {}).get("deviceType", "E-Waste Item")
    est_value = payload.get("estimatedValue", 250)
    points = int(est_value * 1.5)

    # Extract pickup address from payload — frontend sends it as pickupAddress or address
    pickup_address = payload.get("pickupAddress") or payload.get("address") or {}

    # Derive userName and userPhone from user profile or pickup address
    user_name = (user.get("name") if user else None) or pickup_address.get("fullName", "Customer")
    user_phone = (user.get("phone") if user else None) or pickup_address.get("phone", "")

    record = {
        "id": f"sub-{uuid.uuid4().hex[:8]}",
        "trackingId": tracking_id,
        "userId": user_id,
        "userName": user_name,
        "userPhone": user_phone,
        "deviceDetails": payload.get("deviceDetails", {}),
        "deliveryMethod": payload.get("deliveryMethod", "pickup"),
        "pickupAddress": pickup_address,
        # Flatten key address fields for easy worker display
        "address": ", ".join(filter(None, [
            pickup_address.get("addressLine1", ""),
            pickup_address.get("city", ""),
            pickup_address.get("state", "")
        ])) or pickup_address.get("fullName", ""),
        "preferredDate": payload.get("preferredDate", ""),
        "preferredTime": payload.get("preferredTime", ""),
        "selectedCenter": payload.get("selectedCenter", ""),
        "estimatedValue": est_value,
        "pointsValue": points,
        "status": "Scheduled",
        "createdAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    }

    try:
        await db.recycling_submissions.insert_one(record)
        if user:
            query_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
            await db.users.update_one(
                {"$or": [{"_id": query_id}, {"id": user_id}]},
                {"$inc": {"points": points, "totalRecycled": 1.5, "co2Saved": 4.5}}
            )
            await db.notifications.insert_one({
                "id": f"notif-{uuid.uuid4().hex[:6]}",
                "userId": user_id,
                "title": "Recycling Submission Created!",
                "message": f"Your request for {device_type} (Tracking: #{tracking_id}) has been created.",
                "read": False,
                "createdAt": "Just now",
                "type": "pickup"
            })
    except Exception as err:
        print("DB operation skipped in submit_device_recycling:", err)

    return {
        "data": {
            "id": record["id"],
            "trackingId": tracking_id,
            "estimatedValue": est_value,
            "pointsValue": points
        }
    }

@router.post("/schedule-pickup")
async def schedule_pickup(pickupData: dict, user = Depends(get_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if user else "guest"
    pickup_id = f"PKP-{uuid.uuid4().hex[:6].upper()}"
    tracking_id = f"TRK-{uuid.uuid4().hex[:6].upper()}"

    try:
        await db.pickups.insert_one({
            "pickupId": pickup_id,
            "trackingId": tracking_id,
            "userId": user_id,
            "data": pickupData,
            "status": "Scheduled",
            "createdAt": datetime.utcnow()
        })
    except Exception as err:
        print("DB operation skipped in schedule_pickup:", err)

    return {
        "data": {
            "pickupId": pickup_id,
            "scheduledDate": pickupData.get("preferredDate", "Tomorrow"),
            "trackingId": tracking_id
        }
    }

@router.get("/history")
async def get_history(user = Depends(get_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if user else "guest"
    submissions = []
    try:
        cursor = db.recycling_submissions.find({"userId": user_id}).sort("_id", -1)
        submissions = await cursor.to_list(length=50)
    except Exception as err:
        print("DB operation skipped in get_history:", err)

    # Format list
    result = []
    for s in submissions:
        result.append({
            "id": str(s.get("_id")),
            "trackingId": s.get("trackingId", "EVO-0000"),
            "type": s.get("deviceDetails", {}).get("deviceType", "E-Waste Device"),
            "date": s.get("createdAt", "Recently"),
            "points": s.get("pointsValue", 150),
            "status": s.get("status", "Completed"),
            "location": s.get("selectedCenter") or "Home Pickup"
        })

    return {"data": result}


@router.post("/{id}/confirm-recycle")
async def confirm_recycle(id: str, body: dict, user = Depends(get_current_user)):
    points_earned = 300
    if user:
        user_id = str(user.get("_id", user.get("id")))
        query_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
        await db.users.update_one(
            {"$or": [{"_id": query_id}, {"id": user_id}]},
            {"$inc": {"points": points_earned, "totalRecycled": 2.0}}
        )
    return {"data": {"pointsEarned": points_earned}}

@router.get("/recommendations/{id}")
async def get_recommendations(id: str):
    return {
        "data": {
            "recommendations": [
                "Factory reset device and sign out of cloud accounts",
                "Separate removable batteries safely before drop-off",
                "Bundle matching charging cords for additional eco-points"
            ],
            "centers": []
        }
    }
