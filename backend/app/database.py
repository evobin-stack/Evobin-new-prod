from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class DatabaseProxy:
    def __init__(self):
        self._client = None
        self._db = None

    @property
    def client(self):
        if self._client is None:
            self._client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
        return self._client

    @property
    def db(self):
        if self._db is None:
            self._db = self.client[settings.DB_NAME]
        return self._db

    def __getattr__(self, item):
        return getattr(self.db, item)

db = DatabaseProxy()

