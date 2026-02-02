


const API_BASE_URL = '/api/v1';

export interface LoteHistorico {
  id: number;
  camera_id: string;
  start_time: string;
  end_time: string | null;
  final_count: number;
  image_path: string | null;
}

export const getHistoricoLotes = async (): Promise<LoteHistorico[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lotes/historico`);
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
