


from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    func
)
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from typing import Optional
import datetime

Base = declarative_base()

class Lote(Base):
    """
    Representa um lote de contagem de vergalhões no banco de dados.
    """
    __tablename__ = "lotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    camera_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    
    start_time: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    end_time: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    
    final_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="Em Andamento")

    image_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    def __repr__(self):
        return (
            f"<Lote(id={self.id}, camera_id='{self.camera_id}', "
            f"status='{self.status}', final_count={self.final_count})>"
        )
