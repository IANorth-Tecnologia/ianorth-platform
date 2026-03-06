from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
from app.core.inference_service import inference_engine


router = APIRouter()

async def get_video_frames(camera_id: str):

    while True:
        frame = inference_engine.latest_frame
        if frame is not None:
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            
            await asyncio.sleep(1 / 30)  


@router.get("/video_feed/{camera_id}")
async def video_feed(camera_id: str):
    """
    Endpoint de streaming de vídeo MJPEG.
    """
    return StreamingResponse(
        get_video_frames(camera_id),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )
