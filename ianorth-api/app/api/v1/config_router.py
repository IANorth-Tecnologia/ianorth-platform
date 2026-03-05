from fastapi import APIRouter
from pydantic import BaseModel
from app.core.inference_service import inference_engine

router = APIRouter()

class ConfigInput(BaseModel):
    camera_source: str
    model_path: str

@router.post("/configurar")
def configurar_maquina(config: ConfigInput):
    """
    Recebe configurações de câmera e o modelo, e reinicia o motor de IA.
    """

    inference_engine.update_and_restart(config.camera_source, config.model_path)

    return {
        "status": "sucesso",
        "mensagem": "Máquina configurada e IA Reiniciada!",
        "dados": config
    }
