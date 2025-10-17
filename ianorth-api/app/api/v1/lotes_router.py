from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.crud import lote_crud
from app.schemas import lote_schema

router = APIRouter()

@router.get("/lotes/historico", response_model=List[lote_schema.LoteHistorico])
def get_lotes_historico(db: Session = Depends(get_db)):
    """
    Endpoint para obter o histórico de lotes concluídos.
    """
    lotes = lote_crud.get_completed_lotes(db=db)
    return lotes
