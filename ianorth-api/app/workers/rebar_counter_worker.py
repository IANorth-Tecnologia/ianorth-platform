import os, sys, json, cv2, redis, torch, time
from ultralytics import YOLO
from ultralytics.solutions import ObjectCounter

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.core.database import SessionLocal
from app.crud import lote_crud
from app.core.config import settings


UPLOADS_DIR = "/app/uploads"


def cleanup_uploads(directory, max_files=200):
    """
    Mantém apenas os arquivos mais recentes no diretório de uploads para economizar disco.
    """
    try:
        files = [os.path.join(directory, f) for f in os.listdir(directory) 
                 if os.path.isfile(os.path.join(directory, f))]
        
        if len(files) > max_files:
            files.sort(key=os.path.getmtime)
            
            to_delete = files[:len(files) - max_files]
            for f in to_delete:
                os.remove(f)
                print(f"[CLEANUP] Removido arquivo antigo: {os.path.basename(f)}")
    except Exception as e:
        print(f"[CLEANUP] Erro na limpeza: {e}")



def run(camera_id: str, rtsp_url: str, model_file: str):
    """
    Executa o processo de contagem de vergalhões para uma única câmera.
    Esta funcão é projetada para ser executada com um processo separado. 
    """

    CAMERA_ID = camera_id
    RTSP_URL = rtsp_url
    REDIS_HOST = settings.REDIS_HOST
    TARGET_COUNT = settings.TARGET_COUNT
    
    is_video_file = not RTSP_URL.startswith("rtsp://")

    print(f"[{CAMERA_ID}] Iniciando worker (Contagem de Vergalhões) para: {RTSP_URL}")
    print(f"[{CAMERA_ID}] Modo Arquivo de Vídeo (Loop): {is_video_file}")

    if is_video_file:
        W, H = 600, 800
        print(f"[{CAMERA_ID}] Usando dimensões de Retrato ({W}, {H}) para o arquivo de teste.")
    else:
        W, H = 800, 600
        print(f"[{CAMERA_ID}] Usando dimensões de Paisagem ({W}, {H}) para o stream RTSP.")

      
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

    model = YOLO("/app/models/ver70.pt")
    region_points = [(0, 0), (W, 0), (W, H), (0, H)]
    
    counter = ObjectCounter(model="/app/models/ver70.pt")
    counter.reg_pts = region_points
    counter.names = model.names
    counter.draw_tracks = False # Mude para True se quiser ver as trilhas

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    active_lote = None
    cooldown_active = False # Nosso estado de "resfriamento"

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
                print(f"[{CAMERA_ID}] Nenhum lote ativo encontrado. Aguardando...")

            print(f"[{CAMERA_ID}] Conexão bem-sucedida. Iniciando processamento.")
            
            while cap.isOpened():
                success, frame = cap.read()
                
                if not success:
                    if is_video_file:
                        print(f"[{CAMERA_ID}] Vídeo de teste finalizado. Reiniciando (loop)...")
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0) 
                        continue 
                    else:
                        print(f"[{CAMERA_ID}] Frame não pôde ser lido (stream RTSP desconectado?).")
                        break 

                im0 = cv2.resize(frame, (W, H))

                if is_video_file:
                    im0 = cv2.rotate(im0, cv2.ROTATE_90_COUNTERCLOCKWISE)

                results = model.track(im0, persist=True, show=False, verbose=False)
                counter(im0) 
                current_count = counter.in_count 
                # _, jpeg_frame = cv2.imencode('.jpg', im0)
                # redis_client.set(f"video_feed:{CAMERA_ID}", jpeg_frame.tobytes())

                if cooldown_active and current_count == 0:
                    print(f"[{CAMERA_ID}] Campo limpo. Cooldown finalizado. Pronto para novo lote.")
                    cooldown_active = False
                   
                elif active_lote and current_count >= TARGET_COUNT:
                    print(f"[{CAMERA_ID}] LOTE CONCLUÍDO! ID: {active_lote.id}, Contagem final: {current_count}")
                    
                    image_filename = f"lote_{active_lote.id}.jpg"
                    image_save_path = os.path.join(UPLOADS_DIR, image_filename)
                    cv2.imwrite(image_save_path, im0) 
                    print(f"[{CAMERA_ID}] Imagem do lote salva em: {image_save_path}")

                    cleanup_uploads(UPLOADS_DIR, max_files=200)

                    lote_crud.finalize_lote(
                        db, 
                        lote_id=active_lote.id, 
                        final_count=current_count,
                        image_path=image_filename
                    )

                    status = "Concluído"
                    lote_id = active_lote.id
                    progress = 100

                    final_result = {
                        "cameraId": CAMERA_ID, "loteId": lote_id, "currentCount": current_count,
                        "targetCount": TARGET_COUNT, "progress": 100, "status": status
                    }
                    redis_client.publish(f"camera:{CAMERA_ID}", json.dumps(final_result))

                    active_lote = None
                    cooldown_active = True # Inicia o cooldown

                    # Reinicia o contador
                    counter = ObjectCounter(model="/app/models/ver70.pt")
                    counter.reg_pts = region_points
                    counter.names = model.names
                    counter.draw_tracks = False
                    print(f"[{CAMERA_ID}] Contagem reiniciada. Entrando em cooldown até o campo ficar limpo.")

                    continue

                elif not active_lote and not cooldown_active and current_count > 0:
                    active_lote = lote_crud.create_lote(db, camera_id=CAMERA_ID)
                    print(f"[{CAMERA_ID}] NOVO LOTE INICIADO! ID: {active_lote.id}, Contagem inicial: {current_count}")

                if active_lote:
                    status = "Em Andamento"
                    lote_id = active_lote.id
                    progress = min(100, (current_count / TARGET_COUNT) * 100)
                elif cooldown_active:
                    status = "Cooldown"
                    lote_id = None
                    progress = 0 
                else:
                    status = "Aguardando"
                    lote_id = None
                    progress = 0 

                result_payload = {
                    "cameraId": CAMERA_ID,
                    "loteId": lote_id,
                    "currentCount": current_count,
                    "targetCount": TARGET_COUNT,
                    "progress": round(progress, 2),
                    "status": status
                }
                redis_client.publish(f"camera:{CAMERA_ID}", json.dumps(result_payload))

                ret, buffer = cv2.imencode('.jpg', im0)
                if ret:
                    redis_client.setex(f"video_feed:{CAMERA_ID}", 2, buffer.tobytes())
                
                #time.sleep(0.5) 

            cap.release()
            print(f"[{CAMERA_ID}] Conexão com a câmera perdida. Tentando reconectar...")
           
            if is_video_file:
                print(f"[{CAMERA_ID}] Fonte era um arquivo de vídeo. Encerrando worker.")
                break 
            
            #time.sleep(5) 
            
    finally:
        db.close()
        print(f"[{CAMERA_ID}] Conexão com o banco de dados fechada.")
