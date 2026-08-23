from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from typing import List
from app.database import db
from app.auth_utils import require_current_user

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_notifications(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "ack", "message": "Notification socket active", "payload": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

DEFAULT_NOTIFS = [
    {
        "id": "notif-1",
        "_id": "notif-1",
        "title": "Welcome to EvoBin!",
        "message": "Thank you for joining our community. Start recycling your e-waste today to earn points!",
        "read": False,
        "createdAt": "Just now",
        "type": "system"
    }
]

@router.get("")
@router.get("/")
async def get_notifications(user = Depends(require_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if isinstance(user, dict) else "user-1"
    try:
        cursor = db.notifications.find({"$or": [{"userId": user_id}, {"userId": "all"}]}).sort("_id", -1)
        notifs = await cursor.to_list(length=50)

        for n in notifs:
            n["_id"] = str(n["_id"])
            if "id" not in n:
                n["id"] = n["_id"]

        if notifs:
            return {"data": notifs}
    except Exception as err:
        print("DB operation skipped in get_notifications:", err)

    return {"data": DEFAULT_NOTIFS}

@router.put("/{id}/read")
async def mark_as_read(id: str, user = Depends(require_current_user)):
    try:
        await db.notifications.update_one(
            {"$or": [{"id": id}, {"_id": id}]},
            {"$set": {"read": True}}
        )
    except Exception as err:
        print("DB operation skipped in mark_as_read:", err)
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_as_read(user = Depends(require_current_user)):
    user_id = str(user.get("_id", user.get("id"))) if isinstance(user, dict) else "user-1"
    try:
        await db.notifications.update_many(
            {"$or": [{"userId": user_id}, {"userId": "all"}]},
            {"$set": {"read": True}}
        )
    except Exception as err:
        print("DB operation skipped in mark_all_as_read:", err)
    return {"message": "All notifications marked as read"}

@router.delete("/{id}")
async def delete_notification(id: str, user = Depends(require_current_user)):
    try:
        await db.notifications.delete_one({"$or": [{"id": id}, {"_id": id}]})
    except Exception as err:
        print("DB operation skipped in delete_notification:", err)
    return {"message": "Notification deleted"}

