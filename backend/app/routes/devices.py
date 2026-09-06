from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from app.services.ai_service import analyze_device
from app.database import db
from app.auth_utils import get_current_user
from datetime import datetime
from bson import ObjectId
import uuid
import asyncio
from typing import Optional, List

router = APIRouter()

def evaluate_worker_safety_hazards(device_type: str, condition: str = "Good") -> dict:
    device_lower = (device_type or "").lower()
    cond_lower = (condition or "").lower()

    hazard_level = "Low Risk"
    hazards = []
    required_ppe = ["Anti-Static Gloves", "Standard Work Attire"]
    handling_protocol = "Standard electronic waste intake procedure."

    if any(k in device_lower for k in ["smartphone", "laptop", "tablet", "battery", "power bank"]):
        hazards.append("Lithium-Ion Thermal Runaway Risk")
        hazards.append("Pierced Pouch Chemical Leakage")
        required_ppe.extend(["Fire-Resistant ESD Gloves", "Safety Goggles"])
        handling_protocol = "Inspect battery condition immediately. If swollen or punctured, quarantine in non-flammable sand isolation container."
        hazard_level = "Medium Risk" if "poor" not in cond_lower else "High Risk - Hazardous Battery"
    elif any(k in device_lower for k in ["crt", "television", "tv", "monitor"]):
        hazards.append("High-Voltage Capacitor Stored Charge")
        hazards.append("Heavy Lead-Doped Glass Implosion Hazard")
        if "monitor" in device_lower:
            hazards.append("Mercury CCFL Backlight Tube Vapor")
        required_ppe.extend(["High-Voltage Insulated Gloves", "Full Face Shield", "Cut-Resistant Sleeves"])
        handling_protocol = "Discharge capacitors using 10k resistor tool. Do not strike or mechanically crack display funnel."
        hazard_level = "High Risk - High Voltage"
    elif any(k in device_lower for k in ["microwave", "refrigerator", "air conditioner"]):
        hazards.append("High Voltage Magnetron / Compressor Capacitor")
        hazards.append("Refrigerant Gas (CFC/HFC) Evacuation Requirement")
        required_ppe.extend(["Heavy-Duty Leather Gloves", "Respirator Mask"])
        handling_protocol = "Certified refrigerant recovery before mechanical de-manufacturing."
        hazard_level = "Moderate - Specialized Handling"
    else:
        hazards.append("Sharp Sheet Metal Edges")
        hazards.append("Particulate Dust")
        required_ppe.append("Safety Glasses")

    return {
        "hazardLevel": hazard_level,
        "hazards": hazards,
        "requiredPPE": list(set(required_ppe)),
        "handlingProtocol": handling_protocol,
        "automatedSafetyScore": 95 if hazard_level == "Low Risk" else (78 if "Medium" in hazard_level else 52)
    }

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
        safety_assessment = evaluate_worker_safety_hazards(ai_result.get("deviceType", "Smartphone"))

        record = {
            "id": f"dev-{uuid.uuid4().hex[:8]}",
            "userId": user_id,
            "deviceType": ai_result["deviceType"],
            "confidence": ai_result["confidence"],
            "components": ai_result.get("components", []),
            "processed_image_url": ai_result.get("processed_image_url", ""),
            "safetyAssessment": safety_assessment,
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
                "safetyAssessment": safety_assessment,
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

    safety = evaluate_worker_safety_hazards(device_type, condition)

    return {
        "data": {
            "estimatedMoneyValue": money_value,
            "pointsValue": points_value,
            "marketValue": money_value,
            "safetyAssessment": safety,
            "recyclingImpact": {
                "co2Saved": f"{round(base * 0.025, 1)} kg",
                "energySaved": f"{round(base * 0.08, 1)} kWh",
                "waterSaved": f"{int(base * 0.35)} L"
            }
        }
    }

@router.post("/submit")
async def submit_device_recycling(payload: dict, user = Depends(get_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if user else "guest"
    tracking_id = f"EVO-{uuid.uuid4().hex[:6].upper()}"

    device_type = payload.get("deviceDetails", {}).get("deviceType", "E-Waste Item")
    condition = payload.get("deviceDetails", {}).get("condition", "Good")
    safety = evaluate_worker_safety_hazards(device_type, condition)

    est_value = payload.get("estimatedValue", 250)
    points = int(est_value * 1.5)

    pickup_address = payload.get("pickupAddress") or payload.get("address") or {}

    user_name = (user.get("name") if user else None) or pickup_address.get("fullName", "Customer")
    user_phone = (user.get("phone") if user else None) or pickup_address.get("phone", "")

    record = {
        "id": f"sub-{uuid.uuid4().hex[:8]}",
        "trackingId": tracking_id,
        "userId": user_id,
        "userName": user_name,
        "userPhone": user_phone,
        "deviceDetails": payload.get("deviceDetails", {}),
        "safetyAssessment": safety,
        "deliveryMethod": payload.get("deliveryMethod", "pickup"),
        "pickupAddress": pickup_address,
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
            "pointsValue": points,
            "safetyAssessment": safety
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

    result = []
    for s in submissions:
        result.append({
            "id": str(s.get("_id")),
            "trackingId": s.get("trackingId", "EVO-0000"),
            "type": s.get("deviceDetails", {}).get("deviceType", "E-Waste Device"),
            "brand": s.get("deviceDetails", {}).get("brand", ""),
            "model": s.get("deviceDetails", {}).get("model", ""),
            "condition": s.get("deviceDetails", {}).get("condition", "Good"),
            "safetyAssessment": s.get("safetyAssessment"),
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

@router.get("/recommendations")
@router.get("/recommendations/{id}")
async def get_personalized_recommendations(
    id: Optional[str] = "default",
    deviceType: Optional[str] = Query("Smartphone"),
    condition: Optional[str] = Query("Good"),
    city: Optional[str] = Query("Hyderabad")
):
    dev = (deviceType or "Smartphone").capitalize()
    cond = (condition or "Good").capitalize()

    recommendations = [
        f"Perform NIST SP 800-88 cryptographic factory wipe before handover of your {dev}.",
        "Bundle all original power adapters and connectors for extra reward points.",
        f"Verified certified facility in {city} matches specialized recovery for {dev}."
    ]

    if "laptop" in dev.lower() or "desktop" in dev.lower():
        recommendations.insert(1, "Remove secondary storage SSD/HDD if you prefer offline mechanical shredding.")
        recommendations.append("RAM modules can be donated to community refurbishment projects.")
    elif "phone" in dev.lower() or "tablet" in dev.lower():
        recommendations.insert(1, "Eject SIM card and MicroSD card; remove linked Google/Apple account locks.")

    if cond in ["Working", "Excellent"]:
        recommendations.insert(0, f"💡 Your {dev} is in {cond} condition! Consider refurbished resale or social donation for +200 bonus eco-points.")

    matching_facilities = [
        {
            "id": "fac-1",
            "name": f"GreenTech {dev} Certified Recovery Hub",
            "distance": "1.8 km away",
            "rating": 4.9,
            "specialization": f"{dev} & Lithium Battery Neutralization",
            "address": f"HITEC City Sector 2, {city}"
        },
        {
            "id": "fac-2",
            "name": f"EcoCircular Precious Metals Depot",
            "distance": "3.4 km away",
            "rating": 4.8,
            "specialization": "Hydrometallurgical Urban Mining",
            "address": f"Gachibowli Outer Ring Rd, {city}"
        }
    ]

    safety = evaluate_worker_safety_hazards(dev, cond)

    return {
        "data": {
            "deviceType": dev,
            "condition": cond,
            "city": city,
            "recommendations": recommendations,
            "safetyAssessment": safety,
            "matchingFacilities": matching_facilities,
            "suggestedPath": "Refurbish & Donate" if cond in ["Working", "Excellent"] else "Certified Material Extraction"
        }
    }
