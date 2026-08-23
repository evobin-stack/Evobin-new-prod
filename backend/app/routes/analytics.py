from fastapi import APIRouter, Depends
from app.database import db
from app.auth_utils import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics(period: str = "month", user = Depends(get_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if user else "guest"

    recycled = user.get("totalRecycled", 45.2) if user else 45.2
    co2 = user.get("co2Saved", 128.5) if user else 128.5
    points = user.get("points", 2450) if user else 2450

    return {
        "data": {
            "totalEWaste": recycled,
            "co2Saved": co2,
            "pointsEarned": points,
            "itemsProcessed": int(recycled * 0.8) + 5,
            "monthlyGoal": {
                "current": int(recycled),
                "target": 100,
                "percentage": min(100, int((recycled / 100) * 100))
            },
            "monthlyBreakdown": [
                {"month": "Jan", "weight": 8.5, "co2": 22.0},
                {"month": "Feb", "weight": 12.0, "co2": 31.0},
                {"month": "Mar", "weight": 10.2, "co2": 28.5},
                {"month": "Apr", "weight": 14.5, "co2": 47.0}
            ]
        }
    }

@router.get("/impact")
async def get_impact_metrics(user = Depends(get_current_user)):
    user_co2 = user.get("co2Saved", 128.5) if user else 128.5
    user_weight = user.get("totalRecycled", 45.2) if user else 45.2

    return {
        "data": {
            "totalCO2": user_co2,
            "totalEWaste": user_weight,
            "trees": int(user_co2 / 20) + 2,
            "energy": int(user_co2 * 1.5) + 40
        }
    }

@router.get("/export")
async def export_analytics(format: str = "csv", period: str = "month"):
    content = "Month,E-Waste (kg),CO2 Saved (kg),Points\nJan,8.5,22.0,350\nFeb,12.0,31.0,500\nMar,10.2,28.5,450\nApr,14.5,47.0,650\n"
    return {"data": content}
