import os
from pydantic_settings import BaseSettings
from typing import List, Dict, ClassVar, Any



class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    TARGET_COUNT: int = int(os.getenv("TARGET_COUNT", 350))


    MODEL_REGISTRY: ClassVar[Dict[str, Dict[str, str]]] = {
        "REBAR_COUNTER": {
            "script_path": "app.workers.rebar_counter_worker.run", 
            "model_file": "/app/models/ver70.pt"
        },


        "SAFETY_PPE": {
            "script_path": "app.workers.ppe_detector_worker.run", 
            "model_file": "/app/models/ppe_model.pt"
        },
    }

    CAMERA_REGISTRY: ClassVar[Dict[str, Dict[str, str]]] = {
        "cam_patio_1": {
            "name": "Pátio 1 (Ângulo A)",
            "rtsp_url": "rtsp://system:sinobras10@10.6.58.74:554/cam/realmonitor?channel=1&subtype=1",
        },
        "cam_patio_2": {
            "name": "Pátio 1 (Ângulo B)",
            "rtsp_url": "rtsp://admin:eletricasnb2021@10.6.58.75:554/stream",
        },


        "cam_caldeiraria_1": {
            "name": "Segurança Caldeiraria",
            "rtsp_url": "rtsp://admin:senha@10.6.58.80:554/stream",
        }
    }

    CAMERAS_FRONTEND: ClassVar[List[Dict[str, str]]] = [
        {
            "id": "cam_patio_1", 
            "name": "Pátio 1 (Ângulo A)", 
            "websocket_url": "/ws/cam_patio_1"
        },
        {
            "id": "cam_patio_2", 
            "name": "Pátio 1 (Ângulo B)", 
            "websocket_url": "/ws/cam_patio_2"
        },


        {
            "id": "cam_caldeiraria_1", 
            "name": "Segurança Caldeiraria", 
            "websocket_url": "/ws/cam_caldeiraria_1"
        }
    ]

    WORKER_ASSIGNMENTS: ClassVar[List[Dict[str, Any]]] = [
        {
            "model_type": "REBAR_COUNTER",
            "camera_ids": ["cam_patio_1", "cam_patio_2"] # O modelo de vergalhões 
        },


        {
            "model_type": "SAFETY_PPE",
            "camera_ids": ["cam_caldeiraria_1"] # O modelo de segurança 
        }
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
