from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from app.core.config import settings


router = APIRouter()

class Camera(BaseModel):
    id: str
    name: str
    websocket_url: str


@router.get("/cameras", response_model=List[Camera])
def list_cameras():
    """
    Retorna a lista de câmeras configuradas no sistema.
    """
    return settings.CAMERAS_FRONTEND
