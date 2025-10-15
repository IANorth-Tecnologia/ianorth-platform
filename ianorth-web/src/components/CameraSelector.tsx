import React, { useEffect, useState } from 'react';
import type { Camera } from '../services/cameraService';
import { getCameras } from '../services/cameraService';

interface CameraSelectorProps {
  selectedCameraId?: string;
  onSelect: (cameraId: string) => void;
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({ selectedCameraId, onSelect }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCameras()
      .then(list => setCameras(list))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando câmeras...</div>;

  return (
    <div className="bg-white/70 dark:bg-background-secondary/70 p-4 rounded-lg border border-gray-200 dark:border-background-tertiary">
      <h3 className="text-sm font-semibold mb-3">Selecione a Câmera</h3>
      <div className="flex gap-2 flex-wrap">
        {cameras.map(cam => {
          const isSelected = cam.id === selectedCameraId;
          return (
            <button
              key={cam.id}
              onClick={() => onSelect(cam.id)}
              className={`px-3 py-2 rounded-md text-sm border transition-colors duration-150 ${isSelected ? 'bg-accent-primary text-white border-accent-primary' : 'bg-white dark:bg-background-primary text-gray-700 dark:text-text-primary border-gray-200 dark:border-background-tertiary'}`}>
              {cam.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
