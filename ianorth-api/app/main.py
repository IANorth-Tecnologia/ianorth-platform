from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import cameras_router, websocket_gateway

app = FastAPI(title="IANorth Gateway API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja isso!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cameras_router.router, prefix=settings.API_V1_STR)

app.include_router(websocket_gateway.router)

@app.get("/")
def read_root():
    return {"status": "IANorth Gateway API is running."}
