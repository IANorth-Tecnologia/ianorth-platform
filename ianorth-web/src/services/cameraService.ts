

export interface Camera {
  id: string;
  name: string;
  websocket_url: string;  
}

// Mocked list of cameras
/*
const CAMERAS: Camera[] = [
  { id: 'cam-001', name: 'Câmera Entrada', location: 'Portão 1' },
  { id: 'cam-002', name: 'Câmera Linha 1', location: 'Linha A' },
  { id: 'cam-003', name: 'Câmera Linha 2', location: 'Linha B' },
  { id: 'cam-004', name: 'Câmera Saída', location: 'Embalagem' },
];*/ 

const API_BASE_URL = 'http://localhost:8898/api/v1';

export async function getCameras(): Promise<Camera[]> {

    try{
        const response = await fetch(`${API_BASE_URL}/cameras`);

        if (!response.ok){
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        const data: Camera[] = await response.json();
        return data;
    } catch (error){
        console.error("Falha ao buscar a lista de câmeras:", error);

        return [];
    }
}

