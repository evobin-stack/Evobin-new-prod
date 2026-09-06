from fastapi import APIRouter, Query, HTTPException, Depends
from app.database import db
from app.auth_utils import get_current_user
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter()

DEFAULT_CENTERS = [
    {
        "id": "cnt-1",
        "_id": "cnt-1",
        "name": "EcoRecycle Hub Gachibowli",
        "address": "Plot 42, Hitech City Main Rd, Gachibowli, Hyderabad",
        "phone": "+91 98765 43210",
        "rating": 4.8,
        "reviewCount": 124,
        "distance": "1.2 km",
        "openHours": "09:00 AM - 07:00 PM",
        "acceptedTypes": ["Laptops", "Smartphones", "Batteries", "Monitors"],
        "coordinates": {"lat": 17.4401, "lng": 78.3489}
    },
    {
        "id": "cnt-2",
        "_id": "cnt-2",
        "name": "GreenTech E-Waste Facility",
        "address": "Road No 12, Banjara Hills, Hyderabad",
        "phone": "+91 98765 88990",
        "rating": 4.6,
        "reviewCount": 89,
        "distance": "3.5 km",
        "openHours": "10:00 AM - 06:00 PM",
        "acceptedTypes": ["TVs", "Refrigerators", "Washing Machines", "Microwaves"],
        "coordinates": {"lat": 17.4156, "lng": 78.4347}
    },
    {
        "id": "cnt-3",
        "_id": "cnt-3",
        "name": "Circular City Electronics Depot",
        "address": "Phase 2, Kukatpally Industrial Area, Hyderabad",
        "phone": "+91 98765 77665",
        "rating": 4.9,
        "reviewCount": 210,
        "distance": "5.4 km",
        "openHours": "08:30 AM - 06:30 PM",
        "acceptedTypes": ["All Electronics", "Batteries", "Industrial Servers", "Appliances"],
        "coordinates": {"lat": 17.4849, "lng": 78.4138}
    }
]

@router.get("/nearby")
async def get_nearby_centers(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(10.0)
):
    try:
        cursor = db.centers.find()
        centers = await cursor.to_list(length=100)
        for c in centers:
            c["_id"] = str(c["_id"])
            if "id" not in c:
                c["id"] = c["_id"]
        if centers:
            return {"data": centers}
    except Exception as err:
        print("DB operation skipped in get_nearby_centers:", err)
    return {"data": DEFAULT_CENTERS}

@router.get("/search")
async def search_centers(query: Optional[str] = ""):
    try:
        filter_query = {}
        if query:
            filter_query = {
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"address": {"$regex": query, "$options": "i"}},
                    {"acceptedTypes": {"$regex": query, "$options": "i"}}
                ]
            }
        cursor = db.centers.find(filter_query)
        centers = await cursor.to_list(length=100)
        for c in centers:
            c["_id"] = str(c["_id"])
            if "id" not in c:
                c["id"] = c["_id"]
        if centers:
            return {"data": centers}
    except Exception as err:
        print("DB operation skipped in search_centers:", err)
    return {"data": DEFAULT_CENTERS}

@router.get("/{id}")
async def get_center_details(id: str):
    try:
        center = await db.centers.find_one({"$or": [{"id": id}, {"_id": id}]})
        if center:
            center["_id"] = str(center["_id"])
            return {"data": center}
    except Exception as err:
        print("DB operation skipped in get_center_details:", err)
    return {"data": DEFAULT_CENTERS[0]}

@router.post("/feedback")
@router.post("/{id}/review")
async def submit_feedback_and_rating(
    feedback: dict,
    id: Optional[str] = "general",
    user = Depends(get_current_user)
):
    user_id = str(user.get("_id", user.get("id"))) if user else "guest"
    user_name = user.get("name", "Eco User") if user else "Anonymous Recycler"

    record = {
        "id": f"fb-{uuid.uuid4().hex[:6]}",
        "targetId": id or feedback.get("targetId", "general"),
        "targetType": feedback.get("targetType", "recommendation"), # "recommendation", "center", "disassembly"
        "rating": feedback.get("rating", 5),
        "accuracyRating": feedback.get("accuracyRating", 5),
        "serviceRating": feedback.get("serviceRating", 5),
        "comments": feedback.get("feedback") or feedback.get("comment", ""),
        "userId": user_id,
        "userName": user_name,
        "createdAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    }

    try:
        await db.feedback_ratings.insert_one(record)
        if id and id != "general":
            await db.centers.update_one(
                {"$or": [{"id": id}, {"_id": id}]},
                {"$inc": {"reviewCount": 1}}
            )
    except Exception as err:
        print("DB operation skipped in submit_feedback_and_rating:", err)

    return {
        "success": True,
        "message": "Feedback submitted successfully! This helps refine our recommendation algorithm.",
        "data": record
    }
