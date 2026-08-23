from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional, List
from app.database import db
from app.auth_utils import get_current_user, require_current_user
from datetime import datetime
import uuid

router = APIRouter()

DEFAULT_POSTS = [
    {
        "id": "post-1",
        "_id": "post-1",
        "authorName": "Aarav Sharma",
        "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
        "content": "Just dropped off 3 old smartphones and a broken tablet at Gachibowli EcoHub! Earned 450 eco points! 🌿♻️",
        "likes": 24,
        "commentsCount": 5,
        "createdAt": "2 hours ago"
    },
    {
        "id": "post-2",
        "_id": "post-2",
        "authorName": "Priya Patel",
        "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        "content": "Did you know recycling 1 million laptops saves the energy equivalent to electricity used by 3,600 Indian homes in a year?",
        "likes": 42,
        "commentsCount": 8,
        "createdAt": "5 hours ago"
    }
]

DEFAULT_CHALLENGES = [
    {
        "id": "ch-1",
        "_id": "ch-1",
        "title": "Monsoon E-Waste Clean Drive",
        "description": "Recycle at least 2 old electronic items this month.",
        "rewardPoints": 500,
        "participantsCount": 342,
        "endDate": "2026-08-31",
        "active": True
    }
]

@router.get("/posts")
async def get_community_posts():
    try:
        cursor = db.community_posts.find().sort("_id", -1)
        posts = await cursor.to_list(length=100)
        for p in posts:
            p["_id"] = str(p["_id"])
            if "id" not in p:
                p["id"] = p["_id"]
        if posts:
            return {"data": posts}
    except Exception as err:
        print("DB operation skipped in get_community_posts:", err)
    return {"data": DEFAULT_POSTS}

@router.post("/posts")
async def create_community_post(
    content: str = Form(...),
    user = Depends(require_current_user)
):
    user_id = str(user.get("_id", user.get("id"))) if isinstance(user, dict) else "user-1"
    new_post = {
        "id": f"post-{uuid.uuid4().hex[:8]}",
        "authorId": user_id,
        "authorName": user.get("name", "Eco User") if isinstance(user, dict) else "Eco User",
        "authorAvatar": user.get("avatar", f"https://api.dicebear.com/7.x/avataaars/svg?seed=Eco") if isinstance(user, dict) else "https://api.dicebear.com/7.x/avataaars/svg?seed=Eco",
        "content": content,
        "likes": 0,
        "commentsCount": 0,
        "createdAt": "Just now",
        "timestamp": datetime.utcnow()
    }
    try:
        inserted = await db.community_posts.insert_one(new_post)
        new_post["_id"] = str(inserted.inserted_id)
    except Exception as err:
        print("DB insert skipped in create_community_post:", err)
        new_post["_id"] = new_post["id"]

    return {"data": new_post}

@router.post("/posts/{id}/like")
async def like_community_post(id: str):
    try:
        await db.community_posts.update_one(
            {"$or": [{"id": id}, {"_id": id}]},
            {"$inc": {"likes": 1}}
        )
    except Exception as err:
        print("DB update skipped in like_community_post:", err)
    return {"message": "Liked post"}

@router.get("/posts/{id}/comments")
async def get_comments(id: str):
    try:
        cursor = db.comments.find({"postId": id}).sort("_id", 1)
        comments = await cursor.to_list(length=100)
        for c in comments:
            c["_id"] = str(c["_id"])
        if comments:
            return {"data": comments}
    except Exception as err:
        print("DB operation skipped in get_comments:", err)
    return {"data": []}

@router.post("/posts/{id}/comments")
async def add_comment(id: str, body: dict, user = Depends(get_current_user)):
    content = body.get("content", "")
    author_name = user.get("name") if isinstance(user, dict) else "Anonymous Recycler"
    comment = {
        "id": f"comm-{uuid.uuid4().hex[:6]}",
        "postId": id,
        "authorName": author_name,
        "content": content,
        "createdAt": "Just now"
    }
    try:
        await db.comments.insert_one(comment)
        await db.community_posts.update_one(
            {"$or": [{"id": id}, {"_id": id}]},
            {"$inc": {"commentsCount": 1}}
        )
    except Exception as err:
        print("DB insert skipped in add_comment:", err)
    return {"data": comment}

@router.get("/challenges")
async def get_challenges():
    try:
        cursor = db.challenges.find({"active": True})
        challenges = await cursor.to_list(length=50)
        for c in challenges:
            c["_id"] = str(c["_id"])
            if "id" not in c:
                c["id"] = c["_id"]
        if challenges:
            return {"data": challenges}
    except Exception as err:
        print("DB operation skipped in get_challenges:", err)
    return {"data": DEFAULT_CHALLENGES}

@router.post("/challenges/{id}/join")
async def join_challenge(id: str, user = Depends(require_current_user)):
    try:
        await db.challenges.update_one(
            {"$or": [{"id": id}, {"_id": id}]},
            {"$inc": {"participantsCount": 1}}
        )
    except Exception as err:
        print("DB operation skipped in join_challenge:", err)
    return {"message": "Joined challenge successfully"}
