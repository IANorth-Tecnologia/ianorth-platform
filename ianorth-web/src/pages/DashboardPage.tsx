

import React, { useState } from 'react';

import { ThemeToggle } from '../components/ThemeProvider';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { VideoFeed } from '../components/VideoFeed';
import { CameraSelector } from '../components/CameraSelector';
import HistoricoLotes from '../components/historico/HistoricoLotes';

const API_BASE_URL = 'http://localhost:8898/api/v1';

export const DashboardPage: React.FC = () => {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

 /* // Mock mapping camera id -> stream URL (a ser substituído pelo streaming real)
  const videoStreams: Record<string, string> = {
    'cam_patio_1': '/stream1.gif', // Usando o ID real da sua API
  };
*/
    const streamUrl = selectedCameraId 
    ? `${API_BASE_URL}/video_feed/${selectedCameraId}` 
    : undefined;


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img src="/icon.png" alt="IA North Logo" className="h-10 w-10 mr-4"/>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary">
              IA North
            </h1>
            <p className="text-sm text-gray-600 dark:text-text-secondary">Dashboard de Análise de Vergalhões</p>
          </div>
        </div>
        
        <ThemeToggle />
      </header>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4 min-h-[60vh]">
            {/* O CameraSelector agora usa `null` e uma função de callback mais simples */}
            <CameraSelector
              activeCameraId={selectedCameraId} 
              onSelectCamera={(id) => setSelectedCameraId(id)}
            />
            <VideoFeed streamUrl={streamUrl} />
          </div>
          <div className="lg:col-span-2">
            <AnalysisPanel cameraId={selectedCameraId} />
          </div>
        </div>
        
        <HistoricoLotes />
      </main>

      <footer className="text-center mt-8 text-gray-500 dark:text-text-tertiary text-sm">
        <p>© 2025 IANorth Tecnologia. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
