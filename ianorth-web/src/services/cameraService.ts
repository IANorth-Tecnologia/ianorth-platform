export interface Camera {
  id: string;
  name: string;
  location?: string;
}

// Mocked list of cameras
const CAMERAS: Camera[] = [
  { id: 'cam-001', name: 'Câmera Entrada', location: 'Portão 1' },
  { id: 'cam-002', name: 'Câmera Linha 1', location: 'Linha A' },
  { id: 'cam-003', name: 'Câmera Linha 2', location: 'Linha B' },
  { id: 'cam-004', name: 'Câmera Saída', location: 'Embalagem' },
];

export function getCameras(): Promise<Camera[]> {
  // Simula chamada de API
  return new Promise((resolve) => {
    setTimeout(() => resolve(CAMERAS.slice()), 200);
  });
}
