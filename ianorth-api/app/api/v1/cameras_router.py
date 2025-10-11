from fastapi import APIRouter

router = APIRouter()

CAMERAS_DB = [
    {"id": "cam-patio-1", "name": "Câmera Pátio 1", "location": "Entrada Principal"},
    {"id": "cam-esteira-5", "name": "Câmera Esteira 5", "location": "Linha de Produção B"},
    {"id": "cam-doca-3", "name": "Câmera Doca 3", "location": "Área de Expedição"},
]

@router.get("/cameras")
def list_cameras():
    """
    Retorna a lista de câmeras configuradas no sistema.
    """
    return CAMERAS_DB
