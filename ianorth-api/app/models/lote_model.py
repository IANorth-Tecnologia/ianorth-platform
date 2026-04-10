import datetime
import pytz
from sqlalchemy import (
    Column, 
    Integer,
    String,
    DateTime,
    Text
)
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from typing import Optional

Base = declarative_base()

def hora_brasilia():
    return datetime.datetime.now(pytz.timezone('America/Sao_Paulo'))

class Lote(Base):
    __tablename__ = "lotes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    
    start_time: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=hora_brasilia
    )
    end_time: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    
    final_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="Em Andamento")
    image_base64: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self):
        return (
            f"<Lote(id={self.id}, camera_id='{self.camera_id}', "
            f"status='{self.status}', final_count={self.final_count})>"
        )