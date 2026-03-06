from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from app.core.inference_service import inference_engine


router = APIRouter()

@router.websocket("/ws/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: str):
    """Rota para se conectar ao frontend."""
    await websocket.accept()
    print("--- [WS] Frontend Conectado para receber status ---")
    
    try:
        while True:
            stats = inference_engine.latest_stats
            
            await websocket.send_text(json.dumps(stats))
            
            await asyncio.sleep(0.2)
            
    except WebSocketDisconnect:
        print("--- [WS] Frontend Desconectado ---")
