import React, { useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';

interface CameraSelectorProps {
  activeCameraId?: string | null;
  onSelectCamera: (id: string) => void;
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({ activeCameraId, onSelectCamera }) => {
  const LOCAL_CAMERA_ID = 'local';

  useEffect(() => {
    if (activeCameraId !== LOCAL_CAMERA_ID) {
      onSelectCamera(LOCAL_CAMERA_ID);
    }
  }, [activeCameraId, onSelectCamera]);

  return (
    <div className="bg-white/70 dark:bg-background-secondary/70 p-4 rounded-lg border border-gray-200 dark:border-background-tertiary flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-accent-primary/10 text-accent-primary rounded-lg">
          <FiCamera className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary">Monitoramento Local</h3>
          <p className="text-xs text-gray-500 dark:text-text-tertiary">Processamento de Borda (Edge AI)</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 bg-status-success/10 px-3 py-1 rounded-full border border-status-success/20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
        </span>
        <span className="text-sm font-medium text-status-success">Ativo</span>
      </div>
    </div>
  );
};
