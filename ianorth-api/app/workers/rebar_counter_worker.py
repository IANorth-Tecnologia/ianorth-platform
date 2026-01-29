import os, sys, json, cv2, redis, torch, time
from ultralytics import YOLO
from ultralytics.solutions import ObjectCounter

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.core.database import SessionLocal
from app.crud import lote_crud
from app.core.config import settings


UPLOADS_DIR = "/app/uploads"

def run(camera_id: str, rtsp_url: str, model_file: str):
    """
    Executa o processo de contagem de vergalhões para uma única câmera.
    Esta funcão é projetada para ser executada com um processo separado. 
    """

    CAMERA_ID = camera_id
    RTSP_URL = rtsp_url
    REDIS_HOST = settings.REDIS_HOST
    TARGET_COUNT = settings.TARGET_COUNT

    print(f"[{CAMERA_ID}] Iniciando worker (Contagem de Vergalhões) para: {RTSP_URL}")


    if not RTSP_URL:
        print(f"[{CAMERA_ID}] ERRO CRÍTICO: A variável de ambiente RTSP_URL não foi definida. Encerrando worker.")
        return

    print(f"[{CAMERA_ID}] Iniciando worker para a câmera no endereço: {RTSP_URL}")

    try:
        redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)
        redis_client.ping()
        print(f"[{CAMERA_ID}] Conectado ao Redis em {REDIS_HOST}.")
    except redis.exceptions.ConnectionError as e:
        print(f"[{CAMERA_ID}] ERRO CRÍTICO: Não foi possível conectar ao Redis. Erro: {e}")
        return

    db = SessionLocal()
    print(f"[{CAMERA_ID}] Sessão com o banco de dados estabelecida.")

    if torch.cuda.is_available():
        print(f"[{CAMERA_ID}] GPU detectada! Usando dispositivo: {torch.cuda.get_device_name(0)}")
    else:
        print(f"[{CAMERA_ID}] AVISO: GPU não encontrada. Usando CPU.")

    model = YOLO("/app/ver70.pt")
    region_points = [(0, 0), (800, 0), (800, 600), (0, 600)]
    
    counter = ObjectCounter()
    counter.reg_pts = region_points
    counter.names = model.names
    counter.draw_tracks = False

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    active_lote = None 

    try:
        while True:
            print(f"[{CAMERA_ID}] Tentando conectar à câmera...")
            cap = cv2.VideoCapture(RTSP_URL)
            if not cap.isOpened():
                print(f"[{CAMERA_ID}] Erro ao abrir o stream. Tentando novamente em 10s...")
                time.sleep(10)
                continue
            
            active_lote = lote_crud.get_active_lote_by_camera(db, CAMERA_ID)
            if active_lote:
                print(f"[{CAMERA_ID}] Lote ativo ID {active_lote.id} encontrado no banco de dados.")
            else:
                print(f"[{CAMERA_ID}] Nenhum lote ativo encontrado. Aguardando início da contagem para criar um novo.")

            print(f"[{CAMERA_ID}] Conexão bem-sucedida. Iniciando processamento.")
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    print(f"[{CAMERA_ID}] Frame não pôde ser lido.")
                    break

                im0 = cv2.resize(frame, (800, 600))
                _, jpeg_frame = cv2.imencode('.jpg', im0)
                redis_client.set(f"video_feed:{CAMERA_ID}", jpeg_frame.tobytes())
                tracks = model.track(im0, persist=True, show=False, verbose=False)
                counted_frame = counter.start_counting(im0, tracks)
                current_count = counter.in_counts

                status = "Aguardando"
                progress = 0
                lote_id = None
                
                if not active_lote and current_count > 0:
                    active_lote = lote_crud.create_lote(db, camera_id=CAMERA_ID)
                    print(f"[{CAMERA_ID}] NOVO LOTE INICIADO! ID: {active_lote.id}, Contagem inicial: {current_count}")
                
                if active_lote:
                    status = "Em Andamento"
                    lote_id = active_lote.id
                    progress = min(100, (current_count / TARGET_COUNT) * 100)

                    if current_count >= TARGET_COUNT:

                        image_filename = f"lote_{active_lote.id}.jpg"
                        image_save_path = os.path.join(UPLOADS_DIR, image_filename)
                        cv2.imwrite(image_save_path, im0)
                        print(f"[{CAMERA_ID}] Imagem do lote salva em: {image_save_path}")

                        lote_crud.finalize_lote(
                            db, 
                            lote_id=active_lote.id, 
                            final_count=current_count,
                            image_path=image_save_path
                        )
                        print(f"[{CAMERA_ID}] LOTE CONCLUÍDO! ID: {active_lote.id}, Contagem final: {current_count}")
                        status = "Concluído"
                        
                        final_result = {
                            "cameraId": CAMERA_ID, "loteId": lote_id, "currentCount": current_count,
                            "targetCount": TARGET_COUNT, "progress": 100, "status": status
                        }
                        redis_client.publish(f"camera:{CAMERA_ID}", json.dumps(final_result))
                        
                        active_lote = None 
                        time.sleep(10) 
                        continue

                result_payload = {
                    "cameraId": CAMERA_ID,
                    "loteId": lote_id,
                    "currentCount": current_count,
                    "targetCount": TARGET_COUNT,
                    "progress": round(progress, 2),
                    "status": status
                }

                redis_client.publish(f"camera:{CAMERA_ID}", json.dumps(result_payload))
                time.sleep(0.5)

            cap.release()
            print(f"[{CAMERA_ID}] Conexão com a câmera perdida. Tentando reconectar...")
            time.sleep(5)
            
    finally:
        db.close()
        print(f"[{CAMERA_ID}] Conexão com o banco de dados fechada.")
