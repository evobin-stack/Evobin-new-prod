
from datetime import datetime
from typing import List, Dict
from pydantic import BaseModel

class DeviceAnalysis(BaseModel):
    user_id: str | None = None
    deviceType: str
    confidence: float
    components: List[Dict]
    created_at: datetime = datetime.utcnow()
