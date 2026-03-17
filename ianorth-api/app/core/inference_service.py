import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

from os.path import isfile
import cv2
import threading
import time
import json
import numpy as np

from ultralytics import YOLO
from app.core.database import SessionLocal
from app.crud import lote_crud

CONFIG_FILE = "edge_config.json"
UPLOADS_DIR = "/app/uploads"


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
            "targetCount": self.target_count, "progress": 0, "status": "Aguardando"
        }
        self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    config = json.load(f)
                    self.camera_source = config.get("camera_source")
                    self.model_path = config.get("model_path")
                    self.target_count = config.get("target_count", 0)
            except Exception:
                pass
        print(f"[IA] Configuração: Câmera={self.camera_source} | Target={self.target_count}")

    def save_config(self, camera_source, model_path, target_count):
        config = {
            "camera_source": camera_source, 
            "model_path": model_path,
            "target_count": target_count
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

        # MODO DE ESPERA LEVE:
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

        cap = cv2.VideoCapture(source)

        while self.running:
            if not cap.isOpened():
                time.sleep(2)
                cap = cv2.VideoCapture(source)
                continue

            success, frame = cap.read()
            if not success:
                if is_video_file:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0) 
                else:
                    time.sleep(1)
                continue

            im0 = cv2.resize(frame, (W, H))
            if is_video_file:
                im0 = cv2.rotate(im0, cv2.ROTATE_90_COUNTERCLOCKWISE)

            results = model.predict(
                im0,
                conf=0.20,       
                iou=0.5,         
                classes=[0],     
                verbose=False    
            )
            current_count = len(results[0].boxes) if results else 0
            
            # [ALexon] muda visão do box no plot 
            im0 = results[0].plot(labels=False, conf=False, line_width=1)

            if cooldown_active:
                if current_count == 0:
                    print("--- [IA] Fardo removido (0 peças detectadas). Liberando para o próximo lote! ---")
                    cooldown_active = False

            elif not cooldown_active and current_count >= self.target_count:
                if not active_lote:
                    active_lote = lote_crud.create_lote(db, camera_id="local")
                     
                print(f"--- [IA] Meta atingida ({current_count}/{self.target_count}). Fechando Lote! ---")
                image_filename = f"lote_{active_lote.id}.jpg"
                image_save_path = os.path.join(UPLOADS_DIR, image_filename)
                cv2.imwrite(image_save_path, im0)

                self._cleanup_uploads(max_files=200)

                lote_crud.finalize_lote(
                    db, lote_id=active_lote.id, final_count=current_count, image_path=image_filename
                )

                self.latest_stats = {
                    "cameraId": "local", "loteId": active_lote.id, "currentCount": current_count,
                    "targetCount": self.target_count, "progress": 100, "status": "Concluído"
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
                    progress = min(100, (current_count / self.target_count) * 100)
                else:
                    progress = 0
            elif cooldown_active:
                status = "Cooldown"
                lote_id = None
                progress = 0 
            else:
                status = "Aguardando"
                lote_id = None
                progress = 0 

            self.latest_stats = {
                "cameraId": "local", "loteId": lote_id, "currentCount": current_count,
                "targetCount": self.target_count, "progress": round(progress, 2), "status": status
            }

            ret, buffer = cv2.imencode('.jpg', im0)
            if ret:
                self.latest_frame = buffer.tobytes()

            time.sleep(0.03)

        if cap:
            cap.release()
        db.close()

inference_engine = EdgeInferenceEngine()
