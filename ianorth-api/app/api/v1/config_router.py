from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import shutil
import os

from app.core.inference_service import inference_engine

router = APIRouter()

class ConfigInput(BaseModel):
    camera_source: str
    model_path: str
    target_count: int

@router.post("/configurar")
def configurar_maquina(config: ConfigInput):
    """Atualiza as configurações e reinicia o motor da IA."""
    try:
        inference_engine.update_and_restart(
            config.camera_source, 
            config.model_path, 
            config.target_count
        )
        return {
            "status": "sucesso",
            "mensagem": "Máquina configurada e IA Reiniciada!",
            "dados": config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-modelo")
async def upload_modelo(file: UploadFile = File(...)):
    """Recebe um modelo .pt da interface e salva na pasta interna."""
    if not file.filename.endswith('.pt'):
        raise HTTPException(status_code=400, detail="Somente arquivos .pt são permitidos.")
    
    pasta_destinos = "/app/models"
    os.makedirs(pasta_destinos, exist_ok=True)
    caminho_completo = os.path.join(pasta_destinos, file.filename)
    
    with open(caminho_completo, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    return {
        "status": "sucesso", 
        "mensagem": "Upload concluído!",
        "caminho": caminho_completo
    }
