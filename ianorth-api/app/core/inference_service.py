import cv2
import threading
import time
import json
import os

CONFIG_FILE = "edge_config.json"

class EdgeInferenceEngine:
    def __init__(self):
        self.running = False
        self.thread = None
        self.camera_source = "0"
        self.model_path = ""
        self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r") as f:
                config = json.load(f)
                self.camera_source = config.get("camera_source", 0)
                self.model_path = config.get("model_path", "")
            print(f"[IA] Configuração: Câmera={self.camera_source} | Modelo={self.model_path}")

    def save_config(self, camera_source, model_path):
        config = {"camera_source": camera_source, "model_path": model_path}
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f)

    def update_and_restart(self, camera_source, model_path):
        print("--- [IA] Atualizando configurações e reiniciando o motor... ---")
        self.stop()
        self.save_config(camera_source, model_path)
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

    def _run_inference_loop(self):
        source = int(self.camera_source) if self.camera_source.isdigit() else self.camera_source
        cap = cv2.VideoCapture(source)

        while self.running:
            if not cap.isOpened():
                time.sleep(2)
                cap = cv2.VideoCapture(source)
                continue

            ret, frame = cap.read()
            if not ret:
                time.sleep(0.1)
                continue

            #Logica de inferencia aqui 

            time.sleep(0.03)

        cap.release()


inference_engine = EdgeInferenceEngine()
