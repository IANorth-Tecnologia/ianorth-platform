import os
import json
import cv2
import redis
import torch
import time
from ultralytics import YOLO
from ultralytics.solutions import ObjectCounter

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
CAMERA_ID = os.getenv("CAMERA_ID", "default-cam")
RTSP_URL = os.getenv("RTSP_URL")

def main():
    """
    Função principal do worker. Conecta à câmera, processa o vídeo com IA
    e publica os resultados no Redis.
    """
    if not RTSP_URL:
        print(f"[{CAMERA_ID}] ERRO CRÍTICO: A variável de ambiente RTSP_URL não foi definida. Encerrando worker.")
        return

    print(f"[{CAMERA_ID}] Iniciando worker para a câmera no endereço: {RTSP_URL}")

    try:
        redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)
        redis_client.ping()
        print(f"[{CAMERA_ID}] Conectado ao Redis em {REDIS_HOST}.")
    except redis.exceptions.ConnectionError as e:
        print(f"[{CAMERA_ID}] ERRO CRÍTICO: Não foi possível conectar ao Redis. Encerrando. Erro: {e}")
        return

    if torch.cuda.is_available():
        print(f"[{CAMERA_ID}] GPU detectada! Usando dispositivo: {torch.cuda.get_device_name(0)}")
    else:
        print(f"[{CAMERA_ID}] AVISO: GPU não encontrada. Usando CPU (desempenho será inferior).")

    model = YOLO("/app/ver70.pt")

    region_points = [(0, 0), (800, 0), (800, 600), (0, 600)]
    counter = ObjectCounter(
        view_img=False,
        reg_pts=region_points,
        classes_names=model.names,
        draw_tracks=False,
    )

    while True:
        print(f"[{CAMERA_ID}] Tentando conectar à câmera...")
        cap = cv2.VideoCapture(RTSP_URL)
        if not cap.isOpened():
            print(f"[{CAMERA_ID}] Erro ao abrir o stream de vídeo. Tentando novamente em 10 segundos...")
            time.sleep(10)
            continue

        print(f"[{CAMERA_ID}] Conexão com a câmera bem-sucedida. Iniciando processamento.")
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                print(f"[{CAMERA_ID}] Frame não pôde ser lido. O stream pode ter sido encerrado.")
                break

            im0 = cv2.resize(frame, (800, 600))

            tracks = model.track(im0, persist=True, show=False, verbose=False)

            counted_frame = counter.start_counting(im0, tracks)
            count = counter.in_counts 

            result = {"cameraId": CAMERA_ID, "currentCount": count, "status": "contando"}

            redis_client.publish(f"camera:{CAMERA_ID}", json.dumps(result))

            time.sleep(0.5)

        cap.release()
        print(f"[{CAMERA_ID}] Conexão com a câmera perdida. Tentando reconectar...")
        time.sleep(5)


if __name__ == "__main__":
    main()
