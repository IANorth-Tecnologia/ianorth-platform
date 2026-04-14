export interface AnalysisData {
  cameraId: string;
  loteId: number | null;
  currentCount: number;
  targetCount: number;
  progress: number;
  status: 'Aguardando' | 'Em Andamento' | 'Concluído' | 'Cooldown';
}

type MessageCallback = (data: AnalysisData) => void;

const SERVER_IP = import.meta.env.VITE_SERVER_IP || '127.0.0.1';
  
const MACHINE_PORTS: Record<string, number> = {
  'Linha_A': Number(import.meta.env.VITE_PORT_LINHA_A) || 8036,
  'Linha_B': Number(import.meta.env.VITE_PORT_LINHA_B) || 8037,
};

class AnalysisService {
  private sockets: Record<string, WebSocket> = {};
  private callbacks: MessageCallback[] = [];
  private reconnectTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  connect(cameraId: string) {
    if (this.sockets[cameraId]?.readyState === WebSocket.OPEN) return;

    const port = MACHINE_PORTS[cameraId];
    if (!port) return;

    // AQUI ESTAVA O ERRO! A rota direta do FastAPI geralmente é /ws/nome_da_maquina
    const wsUrl = `ws://${SERVER_IP}:${port}/ws/${cameraId}`;
    
    console.log(`[WS] Tentando conectar à máquina: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    this.sockets[cameraId] = socket;

    socket.onopen = () => {
      console.log(`[WS] Conexão estabelecida com sucesso na porta ${port}!`);
    };

    socket.onmessage = (event) => {
      try {
        const data: AnalysisData = JSON.parse(event.data);
        this.callbacks.forEach(cb => cb(data));
      } catch (error) {
        console.error("[WS] Erro ao analisar os dados recebidos:", error);
      }
    };

    socket.onclose = () => {
      console.warn(`[WS] Conexão fechada na porta ${port}. Tentando reconectar...`);
      delete this.sockets[cameraId];
      
      this.reconnectTimers[cameraId] = setTimeout(() => {
        this.connect(cameraId);
      }, 2000);
    };
    
    socket.onerror = (err) => {
      console.error(`[WS] Erro na conexão do WebSocket (${port}):`, err);
    };
  }

  disconnect(cameraId: string) {
    if (this.reconnectTimers[cameraId]) {
      clearTimeout(this.reconnectTimers[cameraId]);
      delete this.reconnectTimers[cameraId];
    }
    
    if (this.sockets[cameraId]) {
      this.sockets[cameraId].onclose = null;
      this.sockets[cameraId].close();
      delete this.sockets[cameraId];
    }
  }

  onMessage(callback: MessageCallback) {
    this.callbacks.push(callback);
  }

  removeListener(callback: MessageCallback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

export const analysisService = new AnalysisService();