import asyncio
import json
import redis.asyncio as redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.config import settings

router = APIRouter()

@router.websocket("/ws/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: str):
    """
    Gerencia a conexão WebSocket para um cliente frontend,
    escutando os resultados de uma câmera específica no Redis.
    """
    await websocket.accept()
    redis_client = redis.from_url(f"redis://{settings.REDIS_HOST}")
    pubsub = redis_client.pubsub()

    channel = f"camera:{camera_id}"
    await pubsub.subscribe(channel)

    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message.get("data"):
                await websocket.send_text(message['data'].decode('utf-8'))

            await websocket.send_text(json.dumps({"status": "ping"}))
            await asyncio.sleep(1)

    except WebSocketDisconnect:
        print(f"Cliente desconectado da câmera {camera_id}")
    finally:
        await pubsub.unsubscribe(channel)
        await redis_client.close()
