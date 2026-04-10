import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.inference_service import inference_engine

router = APIRouter()

@router.websocket("/ws/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    print(f"--- [WS] Frontend Conectado: Câmara {camera_id} ---")
    
    try:
        while True:
            stats = inference_engine.latest_stats
            
           
            safe_stats = {
                "cameraId": str(stats.get("cameraId", camera_id)),
                "loteId": stats.get("loteId"),
                "currentCount": int(stats.get("currentCount", 0)),
                "targetCount": int(stats.get("targetCount", 0)),
                "progress": float(stats.get("progress", 0.0)),
                "status": str(stats.get("status", "Aguardando"))
            }
            
            await websocket.send_text(json.dumps(safe_stats))
            await asyncio.sleep(0.1)  
            
    except WebSocketDisconnect:
        print(f"--- [WS] Frontend Desconectado: Câmara {camera_id} ---")
    except Exception as e:
        print(f"--- [WS] Erro na ligação: {e} ---")