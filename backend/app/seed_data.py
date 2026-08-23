import asyncio
import os
from datetime import datetime
from app.database import db
from app.auth_utils import hash_password

admin_email = os.getenv("ADMIN_EMAIL", "admin@ewaste.com")
admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

async def seed_database(force_reseed: bool = False):
    try:
        user_count = await db.users.count_documents({})
        if user_count > 0 and not force_reseed:
            return

        print("Seeding EvoBin MongoDB Database...")

        # 1. USERS
        if force_reseed:
            await db.users.delete_many({})
        
        users = [
            {
                "id": "user-1",
                "name": "Karthik Reddy",
                "email": "karthikreddy@example.com",
                "password": hash_password("password123"),
                "role": "user",
                "phone": "+91 98765 43210",
                "language": "en",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik",
                "points": 2450,
                "level": 5,
                "totalRecycled": 45.2,
                "co2Saved": 128.5,
                "joinedDate": "2024-01-15",
                "badges": ["First Device", "Eco Warrior", "Community Helper"],
                "emailVerified": True,
                "phoneVerified": True,
                "createdAt": datetime.utcnow()
            },
            {
                "id": "admin-1",
                "name": "Admin User",
                "email": admin_email,
                "password": hash_password(admin_password),
                "role": "admin",
                "phone": "+91 98765 00000",
                "language": "en",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
                "points": 5000,
                "level": 10,
                "totalRecycled": 200.0,
                "co2Saved": 500.0,
                "joinedDate": "2023-06-01",
                "badges": ["Admin", "Super Recycler", "Platform Pioneer"],
                "emailVerified": True,
                "phoneVerified": True,
                "createdAt": datetime.utcnow()
            },
            {
                "id": "worker-1",
                "name": "Suresh Worker",
                "email": "worker@ewaste.com",
                "password": hash_password("worker123"),
                "role": "worker",
                "phone": "+91 98765 11111",
                "language": "hi",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
                "points": 3000,
                "level": 7,
                "totalRecycled": 150.0,
                "co2Saved": 350.0,
                "joinedDate": "2023-09-10",
                "badges": ["Safety First", "Collection Expert"],
                "emailVerified": True,
                "phoneVerified": True,
                "createdAt": datetime.utcnow()
            },
            {
                "id": "org-1",
                "name": "GreenTech Recycling",
                "email": "org@greentech.com",
                "password": hash_password("org123"),
                "role": "organization",
                "phone": "+91 98765 22222",
                "language": "en",
                "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=GreenTech",
                "points": 10000,
                "level": 15,
                "totalRecycled": 500.0,
                "co2Saved": 1200.0,
                "joinedDate": "2023-03-01",
                "badges": ["Verified Organization", "Gold Partner", "Impact Leader"],
                "emailVerified": True,
                "phoneVerified": True,
                "createdAt": datetime.utcnow()
            }
        ]
        await db.users.insert_many(users)
        print("  [OK] Users seeded.")

        # 2. COLLECTION CENTERS
        if force_reseed:
            await db.centers.delete_many({})
        centers = [
            {
                "id": "center-1",
                "name": "Green Tech E-Waste Facility",
                "address": "123 Eco Park Way, Tech Zone, Hyderabad",
                "latitude": 17.4401,
                "longitude": 78.3489,
                "distance": "1.2 km",
                "phone": "+91 40 1234 5678",
                "email": "hyderabad@greentech.com",
                "operatingHours": "Mon-Sat: 9:00 AM - 6:00 PM",
                "acceptedTypes": ["Laptops", "Smartphones", "Batteries", "Monitors", "TVs"],
                "rating": 4.8,
                "reviewCount": 124,
                "verified": True,
                "capacityStatus": "Available"
            },
            {
                "id": "center-2",
                "name": "EcoHub Station",
                "address": "45 Circular Road, Gachibowli, Hyderabad",
                "latitude": 17.4435,
                "longitude": 78.3772,
                "distance": "2.8 km",
                "phone": "+91 40 8765 4321",
                "email": "gachibowli@ecohub.org",
                "operatingHours": "Mon-Sun: 8:00 AM - 8:00 PM",
                "acceptedTypes": ["All Electronics", "Appliance Parts", "Printers"],
                "rating": 4.6,
                "reviewCount": 89,
                "verified": True,
                "capacityStatus": "Available"
            },
            {
                "id": "center-3",
                "name": "City Recyclers Main Depot",
                "address": "78 Industrial Estate, Kukatpally, Hyderabad",
                "latitude": 17.4849,
                "longitude": 78.4138,
                "distance": "5.4 km",
                "phone": "+91 40 9988 7766",
                "email": "contact@cityrecyclers.in",
                "operatingHours": "Mon-Fri: 9:30 AM - 5:30 PM",
                "acceptedTypes": ["Heavy Appliances", "Refrigerators", "Microwaves", "Servers"],
                "rating": 4.9,
                "reviewCount": 210,
                "verified": True,
                "capacityStatus": "Busy"
            }
        ]
        await db.centers.insert_many(centers)
        print("  [OK] Collection centers seeded.")

        # 3. REWARDS
        if force_reseed:
            await db.rewards.delete_many({})
        rewards = [
            {
                "id": "reward-1",
                "title": "INR 500 Amazon Gift Card",
                "description": "Redeem your points for a INR 500 digital gift card on Amazon India.",
                "pointsRequired": 1000,
                "category": "Voucher",
                "code": "AMZ500-ECO2026",
                "sponsor": "Amazon",
                "expiryDays": 90,
                "stock": 50,
                "image": "https://images.unsplash.com/photo-1556742049-0a670fc8a631?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "reward-2",
                "title": "Tree Plantation Certificate",
                "description": "We will plant 5 native trees in your name with GPS tracking details.",
                "pointsRequired": 500,
                "category": "Eco Contribution",
                "code": "TREE5-CERT",
                "sponsor": "Grow-Trees Foundation",
                "expiryDays": 365,
                "stock": 1000,
                "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "reward-3",
                "title": "INR 200 Swiggy Food Coupon",
                "description": "Enjoy INR 200 off your food order on Swiggy.",
                "pointsRequired": 400,
                "category": "Food & Beverage",
                "code": "SWIGGY200-ECO",
                "sponsor": "Swiggy",
                "expiryDays": 30,
                "stock": 100,
                "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
            },
            {
                "id": "reward-4",
                "title": "Eco-friendly Bamboo Water Bottle",
                "description": "Insulated stainless steel bottle with bamboo exterior finish.",
                "pointsRequired": 1500,
                "category": "Merchandise",
                "code": "BAMBOO-BOTTLE-ECO",
                "sponsor": "EvoBin Merchandise",
                "expiryDays": 60,
                "stock": 25,
                "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80"
            }
        ]
        await db.rewards.insert_many(rewards)
        print("  [OK] Rewards seeded.")

        # 4. COMMUNITY POSTS & CHALLENGES
        if force_reseed:
            await db.community_posts.delete_many({})
            await db.challenges.delete_many({})
        posts = [
            {
                "id": "post-1",
                "authorId": "user-1",
                "authorName": "Karthik Reddy",
                "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik",
                "content": "Just recycled 3 old smartphones and an obsolete laptop through EvoBin pickup! Received 750 points instantly. Super smooth experience!",
                "likes": 24,
                "commentsCount": 3,
                "createdAt": "2 hours ago",
                "timestamp": datetime.utcnow()
            },
            {
                "id": "post-2",
                "authorId": "org-1",
                "authorName": "GreenTech Recycling",
                "authorAvatar": "https://api.dicebear.com/7.x/initials/svg?seed=GreenTech",
                "content": "Our upcoming weekend E-Waste Drive is happening this Saturday at Gachibowli Park! Bring your old electronic waste and earn bonus reward points.",
                "likes": 56,
                "commentsCount": 12,
                "createdAt": "1 day ago",
                "timestamp": datetime.utcnow()
            }
        ]
        await db.community_posts.insert_many(posts)

        challenges = [
            {
                "id": "challenge-1",
                "title": "Monsoon Recycling Sprint",
                "description": "Recycle at least 3 old electronic items this week and save 25kg of CO2 emissions.",
                "targetCount": 3,
                "rewardPoints": 500,
                "badge": "Sprint Champion",
                "startDate": "2026-08-15",
                "endDate": "2026-08-31",
                "participantsCount": 184,
                "active": True
            },
            {
                "id": "challenge-2",
                "title": "Zero Cable Waste Challenge",
                "description": "Hand over old unused charging cables and adapters for copper recovery.",
                "targetCount": 5,
                "rewardPoints": 250,
                "badge": "Copper Hero",
                "startDate": "2026-08-01",
                "endDate": "2026-08-25",
                "participantsCount": 92,
                "active": True
            }
        ]
        await db.challenges.insert_many(challenges)
        print("  [OK] Community posts & challenges seeded.")

        # 5. EDUCATION CONTENT & GUIDES
        if force_reseed:
            await db.education_content.delete_many({})
            await db.disassembly_guides.delete_many({})
        content = [
            {
                "id": "edu-1",
                "title": "Why E-Waste Hazard Awareness Matters",
                "category": "Awareness",
                "author": "Dr. Aris Thorne, Environmental Scientist",
                "readTime": "5 min read",
                "summary": "Learn how toxic metals like lead, mercury, and cadmium leak into groundwater if e-waste is improperly dumped in landfills.",
                "content": "Electronic waste contains complex elements including valuable metals (gold, silver, copper) and hazardous substances (lead, cadmium, beryllium). When thrown into municipal garbage, these metals contaminate soil and water systems. Responsible recycling ensures safe extraction and reusability.",
                "views": 1420
            },
            {
                "id": "edu-2",
                "title": "How Gold and Precious Metals Are Extracted Safely",
                "category": "Recycling Process",
                "author": "EvoBin Technical Research Team",
                "readTime": "7 min read",
                "summary": "Discover the hydrometallurgical and pyrometallurgical techniques used to recover precious metals from circuit boards.",
                "content": "Printed circuit boards (PCBs) contain up to 40 times the concentration of gold found in mined ores! Hydrometallurgy uses eco-friendly chemical solutions to selectively dissolve gold and copper without releasing toxic vapors.",
                "views": 890
            }
        ]
        await db.education_content.insert_many(content)

        guides = [
            {
                "id": "guide-laptop",
                "deviceType": "Laptop",
                "title": "Safe Disassembly & Battery Removal for Laptops",
                "difficulty": "Medium",
                "estimatedMinutes": 15,
                "hazards": ["Lithium Battery Puncture Risk", "Sharp Aluminum Edges"],
                "steps": [
                    "Power down laptop completely and unplug power adapter.",
                    "Unscrew back plate using Phillips #0 screwdriver.",
                    "Locate the internal lithium-ion battery connector and gently disconnect it first.",
                    "Remove RAM modules, SSD/HDD storage, and cooling fan.",
                    "Separate display hinges carefully."
                ]
            },
            {
                "id": "guide-mobile",
                "deviceType": "Smartphone",
                "title": "Smartphone Battery & Screen Separation Guide",
                "difficulty": "Easy",
                "estimatedMinutes": 10,
                "hazards": ["Swollen Battery Fire Risk", "Glass Shards"],
                "steps": [
                    "Eject SIM card tray.",
                    "Apply gentle heat to loosen rear glass adhesive.",
                    "Use plastic pry tool to unclip back cover.",
                    "Disconnect battery pull tab without bending the battery."
                ]
            }
        ]
        await db.disassembly_guides.insert_many(guides)
        print("  [OK] Education content & disassembly guides seeded.")

        # 6. EVENTS
        if force_reseed:
            await db.events.delete_many({})
        events = [
            {
                "id": "event-1",
                "title": "Hyderabad Citywide E-Waste Drive 2026",
                "date": "2026-08-28",
                "time": "10:00 AM - 4:00 PM",
                "location": "Gachibowli Stadium Complex, Hyderabad",
                "organizer": "EvoBin & Telangana Pollution Control Board",
                "description": "Drop off any unwanted home electronics, appliances, or cables. Earn double reward points for every laptop or TV donated!",
                "registeredCount": 312,
                "capacity": 500,
                "type": "Drive",
                "status": "Upcoming"
            },
            {
                "id": "event-2",
                "title": "Workshop: Circular Economy & DIY Electronics Repair",
                "date": "2026-09-05",
                "time": "2:00 PM - 5:00 PM",
                "location": "T-Hub Phase 2, Madhapur",
                "organizer": "GreenTech MakerSpace",
                "description": "Hands-on session learning basic PCB solder repair, battery testing, and safe component salvage.",
                "registeredCount": 85,
                "capacity": 100,
                "type": "Workshop",
                "status": "Upcoming"
            }
        ]
        await db.events.insert_many(events)
        print("  [OK] Events seeded.")

        # 7. NOTIFICATIONS
        if force_reseed:
            await db.notifications.delete_many({})
        notifications = [
            {
                "id": "notif-1",
                "userId": "user-1",
                "title": "Device Pickup Confirmed!",
                "message": "Your pickup request for Smartphone (ID: #EVO-8821) has been scheduled for tomorrow at 11:00 AM.",
                "read": False,
                "createdAt": "10 minutes ago",
                "type": "pickup"
            },
            {
                "id": "notif-2",
                "userId": "user-1",
                "title": "Points Credited",
                "message": "You earned 300 eco-points for recycling your old Laptop! Keep up the green impact.",
                "read": True,
                "createdAt": "1 day ago",
                "type": "reward"
            }
        ]
        await db.notifications.insert_many(notifications)
        print("  [OK] Notifications seeded.")

        print("EvoBin MongoDB Database Seeding Complete!")
    except Exception as err:
        print("Database auto-seeding skipped (DB offline or disconnected):", err)

if __name__ == "__main__":
    asyncio.run(seed_database(force_reseed=True))
