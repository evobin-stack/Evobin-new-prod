from fastapi import APIRouter, HTTPException
from app.database import db
from typing import Optional, List

router = APIRouter()

DEFAULT_EDUCATION_CONTENT = [
    {
        "id": "edu-1",
        "_id": "edu-1",
        "title": "Hazardous Materials in E-Waste & Safe Disposal",
        "category": "Awareness",
        "readTime": "5 min read",
        "author": "Dr. Aris Thorne, Environmental Scientist",
        "summary": "Learn about heavy metals like lead, mercury, and cadmium in old electronics and how professional recycling neutralizes environmental risks.",
        "content": "Electronic waste contains complex elements including valuable metals (gold, silver, copper) and hazardous substances (lead, cadmium, beryllium). When thrown into municipal garbage, these metals contaminate soil and water systems. Responsible recycling ensures safe extraction and reusability.",
        "views": 1420
    },
    {
        "id": "edu-2",
        "_id": "edu-2",
        "title": "Step-by-Step Data Wiping for Old Laptops & Phones",
        "category": "Data Security",
        "readTime": "6 min read",
        "author": "EvoBin Security Team",
        "summary": "Complete security guide to wiping personal data before recycling or donating your digital devices.",
        "content": "Before handing over any electronic device, it is critical to perform NIST SP 800-88 compliant sanitization. Learn how to encrypt internal flash storage, trigger cryptographic erasure, remove linked cloud accounts, and perform factory resets safely.",
        "views": 2150
    },
    {
        "id": "edu-3",
        "_id": "edu-3",
        "title": "Urban Mining: Recovering Gold, Silver & Rare Earths",
        "category": "Recycling Process",
        "readTime": "7 min read",
        "author": "EvoBin Technical Research Team",
        "summary": "Discover how circular hydrometallurgy extracts precious metals from printed circuit boards with zero toxic emissions.",
        "content": "Printed circuit boards (PCBs) contain up to 40 times higher concentration of gold than natural ores! Urban mining recovers valuable copper, palladium, and neodymium while dramatically reducing the energy cost compared to virgin mining.",
        "views": 980
    },
    {
        "id": "edu-4",
        "_id": "edu-4",
        "title": "Lithium Battery Safety: Preventing Thermal Runaways",
        "category": "Safety",
        "readTime": "4 min read",
        "author": "Industrial Safety Institute",
        "summary": "Crucial handling instructions for swollen, damaged, or aged lithium-ion batteries prior to collection.",
        "content": "Never puncture or apply heat to lithium-ion batteries. If you notice a battery swelling or overheating, immediately place the device in a non-flammable sand box or fireproof container and request hazardous e-waste pickup.",
        "views": 1640
    }
]

DEFAULT_DISASSEMBLY_GUIDES = {
    "laptop": {
        "id": "guide-laptop",
        "deviceType": "Laptop",
        "title": "Safe Laptop Disassembly & Battery Removal",
        "difficulty": "Medium",
        "estimatedMinutes": 15,
        "toolsRequired": ["Phillips #0 / #00 Screwdriver", "Plastic Pry Tool / Spudger", "Anti-Static Wristband"],
        "hazards": [
            "Lithium-ion battery puncture or thermal hazard",
            "Sharp aluminum & plastic casing edges",
            "Sensitive static discharge to memory chips"
        ],
        "steps": [
            "Power down laptop completely, disconnect AC charger, and hold power button 10s to discharge residual power.",
            "Remove all perimeter screws from bottom chassis cover and organize by screw length.",
            "Insert plastic spudger along seam to unclip base plate without cracking clips.",
            "CRITICAL: Locate internal battery cable connected to motherboard and gently pull connector straight back to disconnect.",
            "Unscrew and remove battery pack carefully without bending cell pouches.",
            "Remove RAM DIMMs by pushing retaining arms outward; unscrew M.2 NVMe SSD.",
            "Separate cooling fan assembly and clean copper heat pipes."
        ],
        "safetyTips": "Never use metal tools near internal battery pouches. If battery is swollen, do not attempt removal—hand over intact."
    },
    "smartphone": {
        "id": "guide-smartphone",
        "deviceType": "Smartphone",
        "title": "Smartphone Battery & Screen Separation Guide",
        "difficulty": "Easy",
        "estimatedMinutes": 10,
        "toolsRequired": ["SIM Ejector Pin", "Plastic Guitar Pick / Spudger", "Heat Gun / Hair Dryer (Low)", "Suction Cup"],
        "hazards": [
            "Cracked glass splinter injury",
            "Swollen battery fire risk if punctured",
            "Adhesive residue irritants"
        ],
        "steps": [
            "Power off smartphone and eject SIM / MicroSD tray using ejector tool.",
            "Apply gentle warmth (approx 60-70°C) around rear edges for 2 minutes to soften adhesive.",
            "Attach suction cup to rear glass, lift gently, and insert plastic pick into seam.",
            "Slice perimeter adhesive carefully avoiding ribbon cables near buttons.",
            "Unscrew battery shield plate and disconnect battery flex cable first before screen cables.",
            "Pull battery release tabs horizontally to slide battery out smoothly."
        ],
        "safetyTips": "Wear safety glasses when handling broken screens. Dispose of adhesive strips responsibly."
    },
    "desktop": {
        "id": "guide-desktop",
        "deviceType": "Desktop",
        "title": "Desktop PC Component Stripping & Safe Depower",
        "difficulty": "Easy",
        "estimatedMinutes": 20,
        "toolsRequired": ["Phillips #2 Screwdriver", "Cable Ties", "Anti-Static Mat"],
        "hazards": [
            "Power Supply Unit (PSU) high voltage capacitor charge",
            "Sharp sheet metal corners in PC cases",
            "Heavy component drop hazard"
        ],
        "steps": [
            "Unplug power cord and switch PSU rocker switch to '0'. Press PC power button to clear capacitor voltage.",
            "Remove thumbscrews and slide off left and right side panels.",
            "Unplug 24-pin ATX, 8-pin CPU, and PCIe power cables from motherboard.",
            "Unscrew PCIe GPU bracket and release PCIe slot latch to remove graphics card.",
            "Remove storage drives (HDD/SSD) and RAM sticks for separate secure data wiping.",
            "Unscrew motherboard standoffs and PSU casing.",
            "WARNING: Do NOT open the sealed Power Supply Unit (PSU) casing—recycle PSU as a sealed unit."
        ],
        "safetyTips": "Internal PSU capacitors can retain deadly charge for hours even when unplugged. Never unscrew the PSU box itself."
    },
    "monitor": {
        "id": "guide-monitor",
        "deviceType": "Monitor",
        "title": "Monitor / Screen Disassembly & Backlight Segregation",
        "difficulty": "Hard",
        "estimatedMinutes": 25,
        "toolsRequired": ["Phillips Screwdriver", "Plastic Pry Bar", "Cut-Resistant Work Gloves"],
        "hazards": [
            "Mercury vapor risk in older CCFL backlit screens",
            "High voltage inverter board capacitors",
            "Large fragile LCD glass panels"
        ],
        "steps": [
            "Unplug monitor from wall and remove desktop stand / VESA mount screws.",
            "Pry front bezel away from rear housing using plastic tool.",
            "Disconnect button ribbon cables and LCD panel LVDS connector.",
            "Remove shielded power board box and logic board.",
            "Identify backlight type: If marked CCFL (Cold Cathode Fluorescent), handle with extreme care to avoid breaking mercury tubes; if LED, safe for mechanical shredding."
        ],
        "safetyTips": "If working with pre-2012 LCD monitors, treat backlights as hazardous mercury waste."
    }
}

SUSTAINABILITY_TIPS = [
    {
        "id": "tip-1",
        "title": "80-20 Battery Charging Rule",
        "category": "Longevity",
        "icon": "BatteryCharging",
        "summary": "Keep device batteries between 20% and 80% to double total charge cycle lifespan from 2 to 4+ years.",
        "details": "Lithium-ion cells experience the highest degradation stress when held at 100% or drained to 0%. Enabling optimized battery charging in OS settings significantly delays battery replacement."
    },
    {
        "id": "tip-2",
        "title": "Thermal Management & Dust Cleaning",
        "category": "Maintenance",
        "icon": "Fan",
        "summary": "Clean laptop and PC fan exhausts every 6 months to reduce thermal throttling and component solder fatigue.",
        "details": "Excess heat degrades semiconductor packaging and battery chemistries. A simple can of compressed air can extend laptop lifespan by over 2 years."
    },
    {
        "id": "tip-3",
        "title": "Upgrade vs Replace Decision Matrix",
        "category": "Circular Economy",
        "icon": "Cpu",
        "summary": "Upgrading RAM or swapping an old HDD to an SSD costs 80% less than buying a new laptop while giving 90% comparable speed.",
        "details": "Most computers discarded due to slowness only suffer from mechanical disk bottlenecks. Upgrading to an SSD extends usability for 3 to 5 additional years."
    },
    {
        "id": "tip-4",
        "title": "Lightweight OS & Software Debloating",
        "category": "Software",
        "icon": "Terminal",
        "summary": "Revive older laptops with lightweight OS alternatives or clean installs to eliminate background bloatware.",
        "details": "Installing Linux distributions like Ubuntu or ChromeOS Flex on older laptops can make 8-year-old hardware snappy for everyday browsing and education."
    }
]

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "Which hazardous heavy metal commonly found in solder of older electronics causes groundwater contamination?",
        "options": ["Lead (Pb)", "Iron (Fe)", "Silicon (Si)", "Titanium (Ti)"],
        "correctAnswer": 0,
        "explanation": "Lead is toxic and was historically used in solder. Professional e-waste recycling isolates lead to prevent severe ecological toxicity."
    },
    {
        "id": 2,
        "question": "What is the safest action when preparing a swollen smartphone battery for recycling?",
        "options": [
            "Puncture it with a needle to relieve pressure",
            "Store in a fireproof container and hand over intact without puncturing",
            "Throw it in regular household trash",
            "Submerge it in hot water"
        ],
        "correctAnswer": 1,
        "explanation": "Never puncture or bend swollen lithium batteries as exposure to moisture and oxygen can cause rapid combustion or thermal runaway."
    },
    {
        "id": 3,
        "question": "How much more concentrated is gold in printed circuit boards compared to naturally mined gold ore?",
        "options": ["About 2 times", "Equal concentration", "Up to 40-50 times more concentrated", "Ore is always higher"],
        "correctAnswer": 2,
        "explanation": "PCBs are high-grade urban ore, containing 40-50x more gold per ton than average natural mines!"
    },
    {
        "id": 4,
        "question": "What does NIST SP 800-88 compliance guarantee before recycling storage devices?",
        "options": [
            "Device physical sanitization & cryptographic data erasure",
            "Screen brightness calibration",
            "Battery charging speed",
            "Wi-Fi connection range"
        ],
        "correctAnswer": 0,
        "explanation": "NIST SP 800-88 is the global gold standard for media sanitization to ensure personal data cannot be recovered."
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

    if category and category != "All":
        filtered = [c for c in DEFAULT_EDUCATION_CONTENT if c.get("category") == category]
        return {"data": filtered if filtered else DEFAULT_EDUCATION_CONTENT}

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

    for art in DEFAULT_EDUCATION_CONTENT:
        if art["id"] == id:
            return {"data": art}

    return {"data": DEFAULT_EDUCATION_CONTENT[0]}

@router.get("/guides/{deviceType}")
async def get_disassembly_guide(deviceType: str):
    key = deviceType.lower()
    for guide_key, guide_data in DEFAULT_DISASSEMBLY_GUIDES.items():
        if guide_key in key or key in guide_key:
            return {"data": guide_data}

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
            "id": f"guide-{key}",
            "deviceType": deviceType,
            "title": f"General Safety & Recycling Preparation for {deviceType}",
            "difficulty": "Easy",
            "estimatedMinutes": 10,
            "toolsRequired": ["Phillips Screwdriver", "Plastic Pry Tool"],
            "hazards": ["Lithium battery short circuit", "Sharp plastic edges"],
            "steps": [
                f"Ensure {deviceType} is fully powered down and unplugged.",
                "Eject any removable batteries, SIM cards, or storage media.",
                "Clean exterior surfaces and bundle accompanying cords.",
                "Hand over to certified EvoBin recycling collection center."
            ],
            "safetyTips": "Do not puncture batteries or force open glued sealed enclosures."
        }
    }

@router.get("/sustainability-tips")
async def get_sustainability_tips():
    return {"data": SUSTAINABILITY_TIPS}

@router.get("/quiz")
async def get_quiz():
    return {"data": QUIZ_QUESTIONS}

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
