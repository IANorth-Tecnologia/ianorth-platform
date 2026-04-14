from fastapi import APIRouter
from pydantic import BaseModel
from app.core.inference_service import inference_engine

router = APIRouter()

class ArduinoStatusResponse(BaseModel):
    status: str
    contagem_atual: int
    meta: int
    meta_atingida: bool

@router.get("/status", response_model=ArduinoStatusResponse)
def get_arduino_status():

    stats = inference_engine.latest_stats

    current_count = int(stats.get("currentCount", 0))
    target_count = int(stats.get("targetCount", 0))
    status = str(stats.get("status", "Aguardando"))

    is_complete = False 
    if target_count > 0 and current_count >= target_count:
        is_complete = True

    if status in ["Concluído", "Cooldown"]:
        is_complete = True

    return {
        "status": str(stats.get("status", "Aguardando")),
        "contagem_atual": current_count,
        "meta": target_count,
        "meta_atingida": is_complete
        
    }

