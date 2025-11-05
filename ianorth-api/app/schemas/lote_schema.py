from pydantic import BaseModel
import datetime
from typing import Optional

class LoteHistorico(BaseModel):
    id: int
    camera_id: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime]
    final_count: int
    image_path: Optional[str] = None

    class Config:
        from_attributes = True 
