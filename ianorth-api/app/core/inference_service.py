import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|fflags;nobuffer|flags;low_delay"

import cv2
import threading
import time
import json
import numpy as np
import base64

from ultralytics import YOLO
from app.core.database import SessionLocal
from app.crud import lote_crud

CONFIG_FILE = "edge_config.json"
UPLOADS_DIR = "/app/uploads"

class RTSPCameraStream:
    def __init__(self, src):
        self.src = src
        self.stream = cv2.VideoCapture(src)
        self.stream.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        self.grabbed, self.frame = self.stream.read()
        self.stopped = False
        self.thread = threading.Thread(target=self.update, daemon=True)
        self.thread.start()

    def update(self):
        while not self.stopped:
            if not self.stream.isOpened():
                time.sleep(1)
                self.stream = cv2.VideoCapture(self.src)
                self.stream.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                continue
            self.grabbed, self.frame = self.stream.read()

    def read(self):
        return self.grabbed, self.frame

    def stop(self):
        self.stopped = True
        if self.thread.is_alive():
            self.thread.join(timeout=1)
        self.stream.release()


class EdgeInferenceEngine:
    def __init__(self):
        self.running = False
        self.thread = None
        self.camera_source = None
        self.model_path = None        
        self.target_count = 0 
        
        black_img = np.zeros((600, 800, 3), dtype=np.uint8)
        cv2.putText(black_img, "Aguardando Configuracao...", (150, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        _, buffer = cv2.imencode('.jpg', black_img)
        self.latest_frame = buffer.tobytes()

        self.latest_stats = {
            "cameraId": "local", "loteId": None, "currentCount": 0,
            "targetCount": self.target_count, "progress": 0.0, "status": "Aguardando"
        }
        self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    config = json.load(f)
                    self.camera_source = config.get("camera_source")
                    self.model_path = config.get("model_path")
                    # Proteção: Força a conversão para inteiro
                    self.target_count = int(config.get("target_count", 0))
            except Exception:
                pass
        print(f"[IA] Configuração: Câmara={self.camera_source} | Target={self.target_count}")

    def save_config(self, camera_source, model_path, target_count):
        config = {
            "camera_source": camera_source, 
            "model_path": model_path,
            "target_count": int(target_count) # Proteção
        }
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f)

    def update_and_restart(self, camera_source, model_path, target_count):
        print("--- [IA] Atualizando configurações e reiniciando o motor... ---")
        self.stop()
        self.save_config(camera_source, model_path, target_count)
        self.load_config()
        self.start() 

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._run_inference_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)

    def _cleanup_uploads(self, max_files=100):
        try:
            files = [os.path.join(UPLOADS_DIR, f) for f in os.listdir(UPLOADS_DIR) 
                     if os.path.isfile(os.path.join(UPLOADS_DIR, f))]
            if len(files) > max_files:
                files.sort(key=os.path.getmtime)
                to_delete = files[:len(files) - max_files]
                for f in to_delete:
                    os.remove(f)
        except Exception:
            pass       

    def _run_inference_loop(self):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

        while self.running and (not self.camera_source or not self.model_path):
            print("--- [IA] Aguardando configuração via Frontend... ---")
            time.sleep(3)
                
        if not self.running:
            return

        cam_str = str(self.camera_source)
        source = int(cam_str) if cam_str.isdigit() else cam_str
        is_video_file = isinstance(source, str) and not source.startswith("rtsp://")

        W, H = (600, 800) if is_video_file else (800, 600)

        try:
            model = YOLO(self.model_path)
        except Exception as e:
            print(f"--- Erro ao carregar modelo: {e} ---")
            self.running = False
            return

        db = SessionLocal()
        active_lote = None
        cooldown_active = False

        if not is_video_file:
            cap = RTSPCameraStream(source)
        else:
            cap = cv2.VideoCapture(source)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        while self.running:
            if not is_video_file:
                success, frame = cap.read()
            else:
                success, frame = cap.read()

            if not success or frame is None:
                if is_video_file:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0) 
                else:
                    time.sleep(0.5)
                continue

            im0 = cv2.resize(frame, (W, H))
            if is_video_file:
                im0 = cv2.rotate(im0, cv2.ROTATE_90_COUNTERCLOCKWISE)

            results = model.predict(im0, conf=0.40, iou=0.5, classes=[0], verbose=False)
            current_count = len(results[0].boxes) if results else 0
            
            im0 = results[0].plot(labels=False, conf=False, line_width=1)

            if cooldown_active:
                if current_count == 0:
                    print("--- [IA] Fardo removido (0 peças detetadas). Libertando para o próximo lote! ---")
                    cooldown_active = False

            elif not cooldown_active and current_count >= self.target_count:
                if not active_lote:
                    active_lote = lote_crud.create_lote(db, camera_id="local")
                     
                print(f"--- [IA] Meta atingida ({current_count}/{self.target_count}). Fechando Lote! ---")
                ret_jpg, buffer_jpg = cv2.imencode('.jpg', im0)
                image_b64_str = None
                if ret_jpg:
                    image_b64_str = base64.b64encode(buffer_jpg).decode('utf-8')

                lote_crud.finalize_lote(
                    db, lote_id=active_lote.id, final_count=current_count, image_base64=image_b64_str
                )

                self.latest_stats = {
                    "cameraId": "local", "loteId": active_lote.id, "currentCount": current_count,
                    "targetCount": self.target_count, "progress": 100.0, "status": "Concluído"
                }

                active_lote = None
                cooldown_active = True
                continue

            elif not active_lote and not cooldown_active and current_count > 0:
                active_lote = lote_crud.create_lote(db, camera_id="local")

            if active_lote:
                status = "Em Andamento"
                lote_id = active_lote.id
                if self.target_count and self.target_count > 0:
                    progress = min(100.0, (current_count / self.target_count) * 100.0)
                else:
                    progress = 0.0
            elif cooldown_active:
                status = "Cooldown"
                lote_id = None
                progress = 0.0 
            else:
                status = "Aguardando"
                lote_id = None
                progress = 0.0 

            self.latest_stats = {
                "cameraId": "local", "loteId": lote_id, "currentCount": current_count,
                "targetCount": self.target_count, "progress": round(progress, 2), "status": status
            }

            ret, buffer = cv2.imencode('.jpg', im0)
            if ret:
                self.latest_frame = buffer.tobytes()

        if cap:
            if not is_video_file:
                cap.stop()
            else:
                cap.release()
        db.close()

inference_engine = EdgeInferenceEngine()