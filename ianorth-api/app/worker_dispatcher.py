import sys
import os
import time
import importlib
import multiprocessing
from app.core.config import settings

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def start_worker_process(camera_id: str, model_type: str):
    """
    Inicia um processo de worker separado para uma câmera e um modelo.
    """
    try:
        model_config = settings.MODEL_REGISTRY.get(model_type)
        if not model_config:
            print(f"[DISPATCHER] Erro: Tipo de modelo '{model_type}' não encontrado no REGISTRO DE MODELOS.")
            return

        camera_details = settings.CAMERA_REGISTRY.get(camera_id)
        if not camera_details:
            print(f"[DISPATCHER] Erro: Câmera ID '{camera_id}' não encontrada no REGISTRO DE CÂMERAS.")
            return
        
        module_path, func_name = model_config["script_path"].rsplit('.', 1)
        module = importlib.import_module(module_path)
        run_function = getattr(module, func_name)

        worker_args = {
            "camera_id": camera_id,
            "rtsp_url": camera_details["rtsp_url"],
            "model_file": model_config["model_file"]
        }

        print(f"[DISPATCHER] Iniciando processo para Câmera: {camera_id} (Modelo: {model_type})")
        p = multiprocessing.Process(target=run_function, kwargs=worker_args, daemon=True)
        p.start()
        return p
    
    except Exception as e:
        print(f"[DISPATCHER] Falha grave ao iniciar worker para {camera_id}: {e}")
        return None

def main():
    """
    Função principal do Gerenciador de Workers.
    Lê a lista de APLICAÇÕES e inicia um processo para cada câmera.
    """
    print(f"--- [DISPATCHER] Iniciando Gerenciador de Workers ---")
    
    processes = []
    
    for app in settings.WORKER_ASSIGNMENTS:
        model_type = app["model_type"]
        camera_ids = app["camera_ids"]
        
        print(f"[DISPATCHER] Carregando aplicação: {model_type} para {len(camera_ids)} câmera(s).")
        
        for cam_id in camera_ids:
            p = start_worker_process(cam_id, model_type)
            if p:
                processes.append(p)

    print(f"[DISPATCHER] {len(processes)} processos de worker iniciados. Monitorando...")
    
    # Mantém o dispatcher vivo
    try:
        while True:
            # (Futuramente, podemos verificar aqui se algum processo falhou e reiniciá-lo)
            time.sleep(60)
    except KeyboardInterrupt:
        print("[DISPATCHER] Desligando... Encerrando processos filhos.")
        for p in processes:
            p.terminate()
        print("[DISPATCHER] Desligado.")

if __name__ == "__main__":
    main()
