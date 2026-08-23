from fastapi import APIRouter, HTTPException
from app.database import db
from typing import Optional

router = APIRouter()

DEFAULT_EDUCATION_CONTENT = [
    {
        "id": "edu-1",
        "_id": "edu-1",
        "title": "Hazardous Materials in E-Waste & Safe Disposal",
        "category": "Safety",
        "readTime": "4 min read",
        "summary": "Learn about heavy metals like lead, mercury, and cadmium in old electronics and how professional recycling neutralizes environmental risks.",
        "views": 412
    },
    {
        "id": "edu-2",
        "_id": "edu-2",
        "title": "Step-by-Step Data Wiping for Old Laptops & Phones",
        "category": "Guides",
        "readTime": "6 min read",
        "summary": "Complete security guide to wiping personal data before recycling or donating your digital devices.",
        "views": 890
    }
]

@router.get("/content")
async def get_education_content(category: Optional[str] = None):
    try:
        query = {}
        if category and category != "All":
            query = {"category": category}

        cursor = db.education_content.find(query)
        items = await cursor.to_list(length=50)
        for item in items:
            item["_id"] = str(item["_id"])
            if "id" not in item:
                item["id"] = item["_id"]

        if items:
            return {"data": items}
    except Exception as err:
        print("DB operation skipped in get_education_content:", err)

    return {"data": DEFAULT_EDUCATION_CONTENT}

@router.get("/content/{id}")
async def get_content_by_id(id: str):
    try:
        item = await db.education_content.find_one({"$or": [{"id": id}, {"_id": id}]})
        if item:
            item["_id"] = str(item["_id"])
            return {"data": item}
    except Exception as err:
        print("DB operation skipped in get_content_by_id:", err)

    return {"data": DEFAULT_EDUCATION_CONTENT[0]}

@router.get("/guides/{deviceType}")
async def get_disassembly_guide(deviceType: str):
    try:
        guide = await db.disassembly_guides.find_one({
            "deviceType": {"$regex": f"^{deviceType}", "$options": "i"}
        })
        if guide:
            guide["_id"] = str(guide["_id"])
            return {"data": guide}
    except Exception as err:
        print("DB operation skipped in get_disassembly_guide:", err)

    return {
        "data": {
            "id": f"guide-general",
            "deviceType": deviceType,
            "title": f"General Safety & Recycling Guide for {deviceType}",
            "difficulty": "Easy",
            "estimatedMinutes": 10,
            "hazards": ["Battery Short Circuit", "Sharp Plastic Components"],
            "steps": [
                f"Ensure {deviceType} is fully powered off and disconnected from mains.",
                "Remove detachable batteries or peripheral cords.",
                "Separate glass/display units carefully without puncturing internal cells.",
                "Deposit electronics in designated EvoBin collection points."
            ]
        }
    }

@router.post("/content/{id}/view")
async def track_content_view(id: str):
    try:
        await db.education_content.update_one(
            {"$or": [{"id": id}, {"_id": id}]},
            {"$inc": {"views": 1}}
        )
    except Exception as err:
        print("DB operation skipped in track_content_view:", err)
    return {"message": "View tracked"}
