from app.core import inference_service
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine
from app.models import lote_model
from app.api.v1 import cameras_router, websocket_gateway, lotes_router, video_router, config_router
from app.core.inference_service import inference_engine

def create_db_and_tables():
    print("--- Verificando e criando tabelas do banco de dados SQLite local ---")
    lote_model.Base.metadata.create_all(bind=engine)
    print("--- Banco pronto para uso ---")

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Inicia o IA em segundo Plano, elimina o Redis 
    inference_engine.start()
    print("--- Servidor Iniciado, IA Rodando ---")
    yield
    inference_engine.stop()
    print("--- Servidor encerrado ---")


app = FastAPI(
    title="IANorth Platform API",
    lifespan=lifespan
)

app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router.router, prefix=settings.API_V1_STR, tags=["Configurações"])

app.include_router(cameras_router.router, prefix=settings.API_V1_STR, tags=["Câmeras"])
app.include_router(lotes_router.router, prefix=settings.API_V1_STR, tags=["Lotes"])
app.include_router(websocket_gateway.router, tags=["Tempo Real"])
app.include_router(video_router.router, prefix=settings.API_V1_STR, tags=["Vídeo"])

@app.get("/")
def read_root():
    return {"status": "IANorth Platform Rodando perfeitamente."}
