from sqlalchemy.orm import Session
from ..models import lote_model
from typing import Optional
from typing import List


def create_lote(db: Session, camera_id: str) -> lote_model.Lote:
    """
    Cria um novo registro de lote no banco de dados com status 'Em Andamento'.

    Args:
        db (Session): A sessão do banco de dados.
        camera_id (str): O ID da câmera que está iniciando a contagem.

    Returns:
        lote_model.Lote: O objeto Lote que foi criado.
    """

    new_lote = lote_model.Lote(camera_id=camera_id, status="Em Andamento")

    db.add(new_lote)
    db.commit()
    db.refresh(new_lote)

    return new_lote

def get_active_lote_by_camera(db: Session, camera_id: str) -> Optional[lote_model.Lote]:
    """
    Busca o lote mais recente que ainda está 'Em Andamento' para uma câmera específica.

    Args:
        db (Session): A sessão do banco de dados.
        camera_id (str): O ID da câmera a ser pesquisada.

    Returns:
        Optional[lote_model.Lote]: O objeto Lote se encontrado, caso contrário None.
    """
    return db.query(lote_model.Lote).filter(
        lote_model.Lote.camera_id == camera_id,
        lote_model.Lote.status == "Em Andamento"
    ).order_by(lote_model.Lote.start_time.desc()).first()

def finalize_lote(db: Session, lote_id: int, final_count: int, image_path: str) -> Optional[lote_model.Lote]:
    """
    Finaliza um lote, atualizando sua contagem final, status e data de término.

    Args:
        db (Session): A sessão do banco de dados.
        lote_id (int): O ID do lote a ser finalizado.
        final_count (int): A contagem final de vergalhões.

    Returns:
        Optional[lote_model.Lote]: O objeto Lote atualizado se encontrado, caso contrário None.
    """

    lote_to_update = db.query(lote_model.Lote).filter(lote_model.Lote.id == lote_id).first()

    if lote_to_update:
        lote_to_update.final_count = final_count
        lote_to_update.status = "Concluído"
        lote_to_update.end_time = lote_model.func.now()
        lote_to_update.image_path = image_path

        db.commit()
        db.refresh(lote_to_update)

    return lote_to_update


def get_completed_lotes(db: Session, skip: int = 0, limit: int = 100) -> List[lote_model.Lote]:
    """
    Busca uma lista de lotes que já foram concluídos.

    Args:
        db (Session): A sessão do banco de dados.
        skip (int): Número de registros a pular (para paginação).
        limit (int): Número máximo de registros a retornar.

    Returns:
        List[lote_model.Lote]: Uma lista de objetos Lote.
    """
    return db.query(lote_model.Lote).filter(
        lote_model.Lote.status == "Concluído"
    ).order_by(
        lote_model.Lote.end_time.desc()  
    ).offset(skip).limit(limit).all()

