import React, { useState } from 'react';
import { ThemeToggle } from '../components/ThemeProvider';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { VideoFeed } from '../components/VideoFeed';
import HistoricoLotes from '../components/historico/HistoricoLotes';
import { ConfigurationModal } from '../components/ConfigurationModal';
import { FiSettings, FiGrid, FiMonitor } from 'react-icons/fi';


const SERVER_IP = import.meta.env.VITE_SERVER_IP || '127.0.0.1';

const AVAILABLE_MACHINES = [
  { id: 'Linha_A', port: Number(import.meta.env.VITE_PORT_LINHA_A) || 8036, name: 'Linha A' },
  { id: 'Linha_B', port: Number(import.meta.env.VITE_PORT_LINHA_B) || 8037, name: 'Linha B' },
];

export const DashboardPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'single' | 'mosaic'>('single');
  const [selectedCameraId, setSelectedCameraId] = useState<string>(AVAILABLE_MACHINES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);  

  
  const SingleMachineView = ({ machineId }: { machineId: string }) => {
    const machine = AVAILABLE_MACHINES.find(m => m.id === machineId);
    const streamUrl = machine ? `http://${SERVER_IP}:${machine.port}/api/v1/video_feed/local` : undefined; 
   
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fadeIn">
        <div className="lg:col-span-3 space-y-4 min-h-[60vh]">
          
          <div className="bg-white/70 dark:bg-background-secondary/70 p-4 rounded-lg border border-gray-200 dark:border-background-tertiary flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3 w-full">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FiMonitor className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary mb-1">Foco da Máquina</h3>
                <select 
                  value={machineId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-black/50 dark:border-gray-700 dark:text-white transition-colors cursor-pointer"
                >
                  {AVAILABLE_MACHINES.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 dark:border-gray-600 bg-black">
            <VideoFeed streamUrl={streamUrl} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <AnalysisPanel cameraId={machineId} />
        </div>
      </div>
    );
  };

 
  const MosaicView = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fadeIn">
        {AVAILABLE_MACHINES.map((machine) => (
          <div key={machine.id} className="bg-white dark:bg-background-secondary p-5 rounded-2xl border border-gray-200 dark:border-background-tertiary shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center">
                <FiMonitor className="mr-2 text-blue-500" /> {machine.name}
              </h3>
              <button 
                onClick={() => { setSelectedCameraId(machine.id); setViewMode('single'); }}
                className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                Focar Câmera
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="rounded-xl overflow-hidden border-2 border-gray-800 bg-black h-full min-h-[250px] shadow-inner flex items-center justify-center">
                <VideoFeed streamUrl={`http://${SERVER_IP}:${machine.port}/api/v1/video_feed/local`} />
              </div>
            
              <div className="h-full min-h-[250px]">
                <AnalysisPanel cameraId={machine.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-background-primary transition-colors duration-700">
      
      <header className="flex items-center justify-between mb-8 bg-white/50 dark:bg-black/30 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center">
          <img src="/icon.png" alt="IA North Logo" className="h-10 w-10 mr-4"/>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary drop-shadow-sm">
              IA North <span className="text-blue-500 font-light">| Dashboard Central</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-text-secondary font-medium">
              Monitorização Direta de Múltiplas Linhas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex space-x-1 shadow-inner border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'single' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FiMonitor className="mr-2" /> Foco
            </button>
            <button
              onClick={() => setViewMode('mosaic')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'mosaic' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FiGrid className="mr-2" /> Mosaico
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2"></div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="p-2 rounded-lg bg-white/80 dark:bg-background-secondary text-gray-600 hover:text-blue-600 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
            title="Configurações do Sistema"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10">
        {viewMode === 'single' ? (
          <SingleMachineView machineId={selectedCameraId} />
        ) : (
          <MosaicView />
        )}
        
        {viewMode === 'single' && (
           <HistoricoLotes activeMachineId={selectedCameraId} />
        )}
      </main>

      <footer className="text-center mt-12 mb-4 text-gray-500 dark:text-text-tertiary text-sm font-medium">
        <p>© 2026 Desenvolvido por IANorth Tecnologia.</p>
      </footer>

      <ConfigurationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />     
    </div>
  );
};

export default DashboardPage;