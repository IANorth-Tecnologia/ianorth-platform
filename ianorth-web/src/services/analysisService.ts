

export interface AnalysisData { 
  loteId: number | null;  
  currentCount: number;
  targetCount: number;
  progress: number;  
  status: 'Em Andamento' | 'Concluído' | 'Aguardando';
}

class AnalysisService { // Gerencia a conexão WebSocket e simulação de dados
  private wsConnection: WebSocket | null = null;
  private readonly wsBaseUrl = 'ws://localhost:8898/ws/';

    

  connect(cameraId: string): void {

    if (this.wsConnection) {
      this.disconnect();
    }

        const fullWsUrl = `${this.wsBaseUrl}${cameraId}`;
        console.log(`[AnalysisService] Conectando a ${fullWsUrl}`);
        this.wsConnection = new WebSocket(fullWsUrl);
  }

  disconnect(): void {
    if (this.wsConnection) {
       console.log(`[AnalysisService] Desconectando...`); 
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  onMessage(callback: (data: AnalysisData) => void): void {
    if (this.wsConnection) {
      this.wsConnection.onmessage = (event) => {
        try{
        const data = JSON.parse(event.data);
        callback(data);
      } catch (e) {
        console.error('[AnalysisService] Erro ao processar mensagem JSON:', e)
    }
  };

    this.wsConnection.onerror = (event) => {
                console.error('[AnalysisService] Erro no WebSocket:', event);
    };
    }
  }
}

export const analysisService = new AnalysisService();
