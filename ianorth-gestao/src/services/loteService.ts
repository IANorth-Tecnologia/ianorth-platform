export interface MaquinaAtiva {
  id: string;
  name: string;
}

export interface LoteHistorico {
  id: number;
  camera_id: string;
  start_time: string;
  end_time: string | null;
  final_count: number;
  image_base64: string | null;
}

const SERVER_IP = import.meta.env.VITE_SERVER_IP || '192.168.1.82';

const MACHINE_PORTS: Record<string, number> = {
  'Maquina_1': Number(import.meta.env.VITE_PORT_MAQUINA_01) || 8037,
  'Maquina_2': Number(import.meta.env.VITE_PORT_MAQUINA_02) || 8039,
};

export const getHistoricoLotes = async (cameraId: string): Promise<LoteHistorico[]> => {
  try {
    const port = MACHINE_PORTS[cameraId];
    if (!port) return [];

    const response = await fetch(`http://${SERVER_IP}:${port}/api/v1/lotes/historico`);
    if (!response.ok) {
      throw new Error(`A resposta da rede não foi 'ok': ${response.statusText}`);
    }
    const data: LoteHistorico[] = await response.json();
    return data;
  } catch (error) {
    console.error("Falha ao buscar o histórico de lotes:", error);
    return [];
  }
};

export const getMaquinasAtivas = async (): Promise<MaquinaAtiva[]> => {
  try {
    const response = await fetch('/api/v1/lotes/maquinas_ativas');
    if (!response.ok) return [];
    
    const data: string[] = await response.json();
    
    return data.map(id => ({
      id: id,
      name: id.replace('_', ' ') 
    }));
  } catch (error) {
    console.error("Erro ao buscar máquinas ativas:", error);
    return [];
  }
};