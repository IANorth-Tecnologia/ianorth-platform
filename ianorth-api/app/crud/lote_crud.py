from datetime import datetime 
from sqlalchemy.orm import Session
from ..models import lote_model
from typing import Optional
from typing import List
import pytz

BR_TZ = pytz.timezone('America/Sao_Paulo')

def get_current_time_br():
    return datetime.now(BR_TZ)

def create_lote(db: Session, camera_id: str) -> lote_model.Lote:

    new_lote = lote_model.Lote(
        camera_id=camera_id, 
        status="Em Andamento",
        start_time=get_current_time_br()
    )
    db.add(new_lote)
    db.commit()
    db.refresh(new_lote)
    return new_lote

def get_active_lote_by_camera(db: Session, camera_id: str) -> Optional[lote_model.Lote]:
    return db.query(lote_model.Lote).filter(
        lote_model.Lote.camera_id == camera_id,
        lote_model.Lote.status == "Em Andamento"
    ).order_by(lote_model.Lote.start_time.desc()).first()

def finalize_lote(db: Session, lote_id: int, final_count: int, image_base64: str = None) -> Optional[lote_model.Lote]:
    lote_to_update = db.query(lote_model.Lote).filter(lote_model.Lote.id == lote_id).first()

    if lote_to_update:
        lote_to_update.final_count = final_count
        lote_to_update.status = "Concluído"
        lote_to_update.end_time = get_current_time_br()
        lote_to_update.image_base64 = image_base64 

        db.commit()
        db.refresh(lote_to_update)

    return lote_to_update

def get_completed_lotes(db: Session, skip: int = 0, limit: int = 100) -> List[lote_model.Lote]:
    return db.query(lote_model.Lote).filter(
        lote_model.Lote.status == "Concluído"
    ).order_by(
        lote_model.Lote.end_time.desc()  
    ).offset(skip).limit(limit).all()