import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.inference_service import inference_engine

router = APIRouter()

async def gen_frames():
    last_frame = None
    while True:
        frame = inference_engine.latest_frame
        
       
        if frame is not None and frame != last_frame:
            last_frame = frame
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
                   
       
        await asyncio.sleep(0.01)

@router.get("/video_feed/{camera_id}")
async def video_feed(camera_id: str):
    """
    Entrega o fluxo contínuo de vídeo em tempo real.
    """
    headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Accel-Buffering": "no"  
    }
    
    return StreamingResponse(
        gen_frames(), 
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers=headers
    )