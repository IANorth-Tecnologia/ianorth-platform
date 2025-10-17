import os
from pydantic_settings import BaseSettings
from typing import List, Dict, ClassVar 
class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

    CAMERAS: ClassVar[List[Dict[str, str]]] = [
        {
            "id": "cam_patio_1",
            "name": "Câmera Pátio 1",
            "websocket_url": "/ws/cam_patio_1"
        },
        # Adicione mais câmeras aqui se necessário
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
