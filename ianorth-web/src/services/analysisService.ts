export interface AnalysisData { // Define a estrutura dos dados de análise
  currentCount: number;
  targetCount: number;
  status: 'contando' | 'concluido' | 'ocioso';
  batchId: string;
}

class AnalysisService { // Gerencia a conexão WebSocket e simulação de dados
  private wsConnection: WebSocket | null = null;
  private readonly wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

  connect(): void {
    if (!this.wsConnection) {
      this.wsConnection = new WebSocket(this.wsUrl);
    }
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  onMessage(callback: (data: AnalysisData) => void): void {
    if (this.wsConnection) {
      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
    }
  }

  // Método simulado para desenvolvimento
  simulateAnalysis(callback: (data: AnalysisData) => void, targetCount: number): number {
    return window.setInterval(() => {
      callback({
        currentCount: Math.floor(Math.random() * targetCount),
        targetCount,
        status: 'contando',
        batchId: 'LOTE-A4B8'
      });
    }, 400);
  }
}

export const analysisService = new AnalysisService();