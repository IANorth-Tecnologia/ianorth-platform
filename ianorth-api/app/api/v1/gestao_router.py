from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    # 1. KPIs GLOBAIS (Fardos e Peças totais de HOJE)
    query_kpis = text("""
        SELECT 
            COUNT(id) as total_fardos,
            ISNULL(SUM(final_count), 0) as total_pecas,
            COUNT(DISTINCT camera_id) as maquinas_ativas
        FROM lotes 
        WHERE CAST(start_time AS DATE) = CAST(GETDATE() AS DATE)
    """)
    res_kpis = db.execute(query_kpis).fetchone()
    
    # 2. FARDOS POR MÁQUINA (Gráfico de Barras - Agora com COUNT)
    query_totais = text("""
        SELECT 
            camera_id, 
            COUNT(id) as total_fardos
        FROM lotes
        WHERE CAST(start_time AS DATE) = CAST(GETDATE() AS DATE)
        GROUP BY camera_id
    """)
    res_totais = db.execute(query_totais).fetchall()
    
    totais_formatados = []
    cores = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']
    for idx, row in enumerate(res_totais):
        nome_limpo = str(row.camera_id).replace('_', ' ')
        totais_formatados.append({
            "nome": nome_limpo,
            "total": row.total_fardos,
            "cor": cores[idx % len(cores)]
        })

    # 3. FARDOS POR HORA (Gráfico de Linha - Agora com COUNT)
    query_hora = text("""
        SELECT 
            DATEPART(HOUR, start_time) as hora,
            camera_id,
            COUNT(id) as total_fardos
        FROM lotes
        WHERE CAST(start_time AS DATE) = CAST(GETDATE() AS DATE)
        GROUP BY DATEPART(HOUR, start_time), camera_id
        ORDER BY hora ASC
    """)
    res_hora = db.execute(query_hora).fetchall()
    
    dados_hora_dict = {}
    for row in res_hora:
        hora_str = f"{row.hora:02d}:00"
        cam_id = row.camera_id
        if hora_str not in dados_hora_dict:
            dados_hora_dict[hora_str] = {"hora": hora_str}
        dados_hora_dict[hora_str][cam_id] = row.total_fardos

    return {
        "kpis": {
            "fardos_hoje": res_kpis.total_fardos,
            "pecas_hoje": res_kpis.total_pecas,
            "maquinas_ativas": res_kpis.maquinas_ativas
        },
        "totais_por_maquina": totais_formatados,
        "producao_hora": list(dados_hora_dict.values())
    }
