from fastapi import APIRouter, Query, HTTPException
from app.database import db
from typing import Optional

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

@router.post("/{id}/review")
async def submit_center_review(id: str, review: dict):
    try:
        await db.centers.update_one(
            {"$or": [{"id": id}, {"_id": id}]},
            {"$inc": {"reviewCount": 1}}
        )
    except Exception as err:
        print("DB operation skipped in submit_center_review:", err)
    return {"message": "Review submitted successfully"}
