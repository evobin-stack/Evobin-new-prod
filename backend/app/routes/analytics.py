from fastapi import APIRouter, Depends, Query
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
                {"month": "Apr", "weight": 14.5, "co2": 47.0},
                {"month": "May", "weight": 9.8, "co2": 26.3},
                {"month": "Jun", "weight": 13.1, "co2": 35.8},
                {"month": "Jul", "weight": 16.4, "co2": 44.2},
                {"month": "Aug", "weight": round(recycled * 0.25, 1), "co2": round(co2 * 0.25, 1)}
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
            "water": int(user_weight * 25),
            "energy": int(user_co2 * 3.5),
            "landfillAvoided": user_weight,
            "toxicMaterialsDiverted": round(user_weight * 0.18, 2),
            "preciousMetalsRecovered": {
                "goldGrams": round(user_weight * 0.08, 2),
                "copperGrams": round(user_weight * 140, 1),
                "silverGrams": round(user_weight * 0.45, 2)
            }
        }
    }

@router.get("/impact-assessment")
async def calculate_impact_assessment(
    deviceType: str = Query("Smartphone"),
    quantity: int = Query(1),
    choice: str = Query("recycle") # "recycle", "landfill", "refurbish"
):
    # Base coefficients per unit
    unit_weights = {
        "Smartphone": 0.2,
        "Laptop": 2.2,
        "Desktop": 8.5,
        "Monitor": 4.5,
        "Television": 12.0,
        "Microwave": 14.0,
        "Refrigerator": 45.0,
        "Tablet": 0.5,
        "Other": 1.5
    }
    weight_kg = unit_weights.get(deviceType, 1.0) * quantity

    if choice == "recycle":
        co2_saved = round(weight_kg * 2.8, 2)
        toxic_diverted = round(weight_kg * 0.15, 2)
        water_saved = round(weight_kg * 32, 1)
        energy_saved = round(weight_kg * 4.2, 1)
        circular_efficiency = 92
        description = "Maximum material circularity: 92% of raw materials returned to industrial supply chain without ground leaching."
    elif choice == "refurbish":
        co2_saved = round(weight_kg * 5.4, 2)
        toxic_diverted = round(weight_kg * 0.2, 2)
        water_saved = round(weight_kg * 65, 1)
        energy_saved = round(weight_kg * 8.5, 1)
        circular_efficiency = 98
        description = "Highest ecological score: Prevents new manufacturing emissions entirely by extending product life."
    else: # landfill
        co2_saved = 0.0
        toxic_diverted = 0.0
        water_saved = 0.0
        energy_saved = 0.0
        circular_efficiency = 0
        description = "Severe negative impact: Toxic lead, cadmium, and battery electrolytes slowly leach into soil and aquifers."

    return {
        "data": {
            "deviceType": deviceType,
            "quantity": quantity,
            "choice": choice,
            "weightKg": weight_kg,
            "co2SavedKg": co2_saved,
            "toxicDivertedKg": toxic_diverted,
            "waterSavedLiters": water_saved,
            "energySavedKwh": energy_saved,
            "circularEfficiencyPct": circular_efficiency,
            "description": description,
            "comparison": {
                "recycleVsLandfillCO2Delta": round(weight_kg * 2.8, 1),
                "treesEquivalent": max(1, int(co2_saved / 20)),
                "carMilesEquivalent": round(co2_saved * 2.5, 1)
            }
        }
    }

@router.get("/carbon-tracker")
async def get_carbon_footprint_tracker(user = Depends(get_current_user)):
    user_co2 = user.get("co2Saved", 128.5) if user else 128.5
    monthly_target = 50.0
    current_month_co2 = round(user_co2 * 0.35, 1)

    return {
        "data": {
            "totalCO2Saved": user_co2,
            "monthlyTarget": monthly_target,
            "currentMonthSavings": current_month_co2,
            "targetProgressPercentage": min(100, int((current_month_co2 / monthly_target) * 100)),
            "streakDays": 8,
            "rankPercentile": "Top 5% of Recyclers in Hyderabad",
            "historicalMilestones": [
                {"title": "First 10kg CO₂ Milestone", "date": "2024-02-10", "achieved": True},
                {"title": "50kg CO₂ Tree Sitter", "date": "2024-04-15", "achieved": True},
                {"title": "100kg CO₂ Climate Hero", "date": "2024-07-20", "achieved": user_co2 >= 100},
                {"title": "250kg CO₂ Net-Zero Champion", "date": "Upcoming", "achieved": user_co2 >= 250}
            ],
            "equivalentMetrics": {
                "treesPlanted": int(user_co2 / 20) + 2,
                "flightKmAvoided": int(user_co2 * 8.2),
                "smartphoneCharges": int(user_co2 * 122),
                "carKmDiverted": int(user_co2 * 4.1)
            }
        }
    }

@router.get("/export")
async def export_analytics(format: str = "csv", period: str = "month"):
    content = "Month,E-Waste (kg),CO2 Saved (kg),Points,Water Saved (L),Energy (kWh)\nJan,8.5,22.0,350,210,38\nFeb,12.0,31.0,500,300,52\nMar,10.2,28.5,450,255,44\nApr,14.5,47.0,650,360,68\nMay,9.8,26.3,420,245,41\nJun,13.1,35.8,580,327,56\nJul,16.4,44.2,710,410,72\n"
    return {"data": content}
