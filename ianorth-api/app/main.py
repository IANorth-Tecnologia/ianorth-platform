from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.models import lote_model
from app.api.v1 import websocket_gateway, lotes_router, video_router, config_router, arduino_router, gestao_router 
from app.core.inference_service import inference_engine

def create_db_and_tables():
    print("--- Tentando conectar ao banco de dados e criar tabelas... ---")
    try:
      
        with engine.connect() as connection:
            result = connection.execute(text("SELECT @@VERSION"))
            for row in result:
                print(f"--- Conectado com Sucesso ao SQL Server: {row[0]} ---")
        
       
        lote_model.Base.metadata.create_all(bind=engine)
        print("--- Tabelas do banco de dados verificadas/criadas com sucesso ---")
        
    except Exception as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(f"ERRO CRÍTICO AO CONECTAR NO BANCO DE DADOS:")
        print(str(e))
        print("O sistema continuará rodando em memória, mas não salvará os dados!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    inference_engine.start()
    print("--- Servidor Iniciado, IA Rodando ---")
    yield
    inference_engine.stop()
    print("--- Servidor encerrado ---")


app = FastAPI(
    title="IANorth Platform API",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router.router, prefix=settings.API_V1_STR, tags=["Configurações"])

app.include_router(lotes_router.router, prefix=settings.API_V1_STR, tags=["Lotes"])
app.include_router(websocket_gateway.router, tags=["Tempo Real"])
app.include_router(video_router.router, prefix=settings.API_V1_STR, tags=["Vídeo"])

app.include_router(arduino_router.router, prefix=settings.API_V1_STR + "/arduino", tags=["Integração Arduino"])
app.include_router(gestao_router.router, prefix=settings.API_V1_STR + "/gestao", tags=["BI e Gestão"])

@app.get("/")
def read_root():
    return {"status": "IANorth Platform Rodando perfeitamente."}
