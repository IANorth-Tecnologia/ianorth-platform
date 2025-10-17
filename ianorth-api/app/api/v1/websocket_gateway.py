import asyncio
import json
import redis.asyncio as redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
from app.core.config import settings

router = APIRouter()

class ConnectionManager:
    """Gerencia as conexões WebSocket ativas de forma centralizada."""
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, camera_id: str):
        await websocket.accept()
        if camera_id not in self.active_connections:
            self.active_connections[camera_id] = []
        self.active_connections[camera_id].append(websocket)
        print(f"Nova conexão para a câmera {camera_id}. Total: {len(self.active_connections[camera_id])}")

    def disconnect(self, websocket: WebSocket, camera_id: str):
        if camera_id in self.active_connections:
            self.active_connections[camera_id].remove(websocket)
            print(f"Conexão fechada para a câmera {camera_id}. Restantes: {len(self.active_connections[camera_id])}")

    async def broadcast(self, message: str, camera_id: str):
        """Envia uma mensagem para todos os clientes conectados a uma câmera específica."""
        if camera_id in self.active_connections:
            for connection in self.active_connections[camera_id][:]:
                try:
                    await connection.send_text(message)
                except WebSocketDisconnect:
                    self.disconnect(connection, camera_id)

manager = ConnectionManager()

async def redis_listener(manager: ConnectionManager):
    """Cria UMA ÚNICA conexão com o Redis e ouve todos os canais de câmera."""
    while True:
        try:
            r = redis.from_url(f"redis://{settings.REDIS_HOST}", decode_responses=True)
            pubsub = r.pubsub()
            await pubsub.psubscribe("camera:*")
            print("--- Listener do Redis iniciado, aguardando mensagens em 'camera:*' ---")
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=None)
                if message:
                    channel = message['channel']
                    camera_id = channel.split(':')[-1]
                    data = message['data']
                    await manager.broadcast(data, camera_id)
        except asyncio.CancelledError:
            print("--- Listener do Redis cancelado ---")
            break
        except Exception as e:
            print(f"ERRO CRÍTICO no listener do Redis: {e}. Tentando reconectar em 5s...")
            await asyncio.sleep(5)

@router.websocket("/ws/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: str):
    """Apenas gerencia o ciclo de vida da conexão de um cliente."""
    await manager.connect(websocket, camera_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, camera_id)
