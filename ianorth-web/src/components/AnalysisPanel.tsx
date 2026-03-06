
export interface AnalysisData {
  cameraId: string;
  loteId: number | null;
  currentCount: number;
  targetCount: number;
  progress: number;
  status: 'Aguardando' | 'Em Andamento' | 'Concluído' | 'Cooldown';
}

type MessageCallback = (data: AnalysisData) => void;

class AnalysisService {
  private socket: WebSocket | null = null;
  private callbacks: MessageCallback[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentCameraId: string | null = null;

  private getWsUrl(cameraId: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; 
    return `${protocol}//${host}/api/v1/ws/${cameraId}`;
  }

  connect(cameraId: string) {
    if (this.socket?.readyState === WebSocket.OPEN && this.currentCameraId === cameraId) {
      return; 
    }

    this.disconnect();
    this.currentCameraId = cameraId;
    
    const wsUrl = this.getWsUrl(cameraId);
    console.log(`[WS] Conectando Sistema: ${wsUrl}`);
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      try {
        const data: AnalysisData = JSON.parse(event.data);
        this.callbacks.forEach(cb => cb(data));
      } catch (error) {
        console.error('[WS] Erro ao processar dados da IA:', error);
      }
    };

    this.socket.onclose = () => {
      console.warn('[WS] Conexão com a IA perdida. Tentando reconectar em 2s...');
      this.socket = null;
      this.reconnectTimer = setTimeout(() => {
        if (this.currentCameraId) this.connect(this.currentCameraId);
      }, 2000);
    };

    this.socket.onerror = (error) => {
      console.error('[WS] Erro na conexão do Sistema:', error);
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.onclose = null; 
      this.socket.close();
      this.socket = null;
    }
    this.currentCameraId = null;
  }

  onMessage(callback: MessageCallback) {
    this.callbacks.push(callback);
  }

  removeListener(callback: MessageCallback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

export const analysisService = new AnalysisService();
