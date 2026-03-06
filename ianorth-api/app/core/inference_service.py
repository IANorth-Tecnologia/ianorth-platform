from os.path import isfile
import cv2
import threading
import time
import json
import os
import torch 

from ultralytics import YOLO
from ultralytics.solutions import ObjectCounter
from app.core.database import SessionLocal
from app.crud import lote_crud

CONFIG_FILE = "edge_config.json"
UPLOADS_DIR = "/app/uploads"
MODELO_IA = "/app/models/ver37.pt" #path do Modelo, mudar aqui
COUNT = 50 #adiciona limite alvo

class EdgeInferenceEngine:
    def __init__(self):
        self.running = False
        self.thread = None
        self.camera_source = "0"
        self.model_path = MODELO_IA         
        self.target_count = COUNT 
        self.latest_frame = None
        self.latest_stats = {
            "cameraId": "local", "loteId": None, "currentCount": 0,
            "targetCount": self.target_count, "progress": 0, "status": "Aguardando"
        }

        self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r") as f:
                config = json.load(f)
                self.camera_source = config.get("camera_source", 0)
                self.model_path = config.get("model_path", MODELO_IA)
                self.target_count = config.get("target_count", COUNT)
            print(f"[IA] Configuração: Câmera={self.camera_source} | Modelo={self.model_path}")

    def save_config(self, camera_source, model_path, target_count=COUNT):
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
            #Inicia a leitura do video 
            self.thread = threading.Thread(target=self._run_inference_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()


    def _cleanup_uploads(self, max_files=100):
        try:
            files = [os.path.join(UPLOADS_DIR, f) for f in os.listdir(UPLOADS_DIR) 
                     if os.path.isfile(os.path.join(UPLOADS_DIR, f))]
            if len(files) > max_files:
                files.sort(key=os.path.getmtime)
                to_delete = files[:len(files) - max_files]
                for f in to_delete:
                    os.remove(f)
        except Exception as e:
            print(f"[CLEANUP] Erro: {e}")       

    def _run_inference_loop(self):
        """
            A Logica de contagem Unificada...
        """
        os.makedirs(UPLOADS_DIR, exist_ok=True)

        source = int(self.camera_source) if self.camera_source.isdigit() else self.camera_source
        is_video_file = isinstance(source, str) and not source.startswith("rtsp://")

        W, H = (600, 800) if is_video_file else (800, 600)
        region_points = [(0, 0), (0, 600), (800, 600), (800, 0)]

        try:
            model = YOLO(self.model_path)
            counter = ObjectCounter(model=self.model_path)
            counter.reg_pts = region_points
            counter.names = model.names
            counter.draw_tracks = False
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
            if not succes:
                if is_video_file:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0) #loop no video de test 
                else:
                    time.sleep(1)
                continue

            im0 = cv2.resize(frame, (W, H))
            if is_video_file:
                im0 cv2.rotate(im0, cv2.ROTATE_90_COUNTERCLOKWISE)

            #inferencia 
            results = model.track(im0, persist=True, show=False, verbose=False, show_labels=False)
            current_count = counter(im0)

            #Banco de dados e Lotes 
            if cooldown_active and current_count == 0:
                cooldown_active = False

            elif active_lote and current_count >= self.target_count:
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
                
                # reinicia o contador para o próximo lote
                counter = ObjectCounter(model=self.model_path)
                counter.reg_pts = region_points
                counter.names = model.names
                counter.draw_tracks = False
                continue


            elif not active_lote and not cooldown_active and current_count > 0:
                active_lote = lote_crud.create_lote(db, camera_id="local")

            # Atualiza status 
            if active_lote:
                status, lote_id = "Em Andamento", active_lote.id
                progress = min(100, (current_count / self.target_count) * 100)
            elif cooldown_active:
                status, lote_id, progress = "Cooldown", None, 0 
            else:
                status, lote_id, progress = "Aguardando", None, 0 

            self.latest_stats = {
                "cameraId": "local", "loteId": lote_id, "currentCount": current_count,
                "targetCount": self.target_count, "progress": round(progress, 2), "status": status
            }

            # Salva o frame processado na memória
            ret, buffer = cv2.imencode('.jpg', im0)
            if ret:
                self.latest_frame = buffer.tobytes()

            time.sleep(0.03)

        cap.release()
        db.close()


inference_engine = EdgeInferenceEngine()
