from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.config import settings
from app.core.database import engine
from app.models import lote_model
from app.api.v1 import cameras_router, websocket_gateway, lotes_router, video_router

def create_db_and_tables():
    print("--- Verificando e criando tabelas do banco de dados ---")
    lote_model.Base.metadata.create_all(bind=engine)
    print("--- Tabelas prontas para uso ---")

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Inicia o listener do Redis como uma tarefa em segundo plano
    redis_task = asyncio.create_task(websocket_gateway.redis_listener(websocket_gateway.manager))
    yield
    redis_task.cancel()
    print("--- Servidor encerrado, listener do Redis cancelado ---")


app = FastAPI(
    title="IANorth Gateway API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cameras_router.router, prefix=settings.API_V1_STR, tags=["Câmeras"])
app.include_router(lotes_router.router, prefix=settings.API_V1_STR, tags=["Lotes"])
app.include_router(websocket_gateway.router, tags=["Tempo Real"])
app.include_router(video_router.router, prefix=settings.API_V1_STR, tags=["Vídeo"])

@app.get("/")
def read_root():
    return {"status": "IANorth Gateway API is running."}
