import asyncio
from fastapi import APIRouter
from starlette.responses import StreamingResponse
import redis.asyncio as redis
from app.core.config import settings

router = APIRouter()

async def get_video_frames(camera_id: str):
    """
    Um gerador assíncrono que busca frames do Redis e os formata para um stream MJPEG.
    """
    r = redis.from_url(f"redis://{settings.REDIS_HOST}")
    redis_channel = f"video_feed:{camera_id}"
    
    while True:
        try:
            frame_bytes = await r.get(redis_channel)
            
            if frame_bytes:
                # Formata a resposta para o padrão MJPEG
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Controla a taxa de quadros (FPS) para não sobrecarregar
            await asyncio.sleep(1 / 30)  # Aproximadamente 30 FPS
        except asyncio.CancelledError:
            print(f"Streaming para {camera_id} cancelado.")
            break
        except Exception as e:
            print(f"Erro no streaming de vídeo para {camera_id}: {e}")
            await asyncio.sleep(1)


@router.get("/video_feed/{camera_id}")
async def video_feed(camera_id: str):
    """
    Endpoint de streaming de vídeo MJPEG.
    """
    return StreamingResponse(
        get_video_frames(camera_id),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )
