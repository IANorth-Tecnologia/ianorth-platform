import React, { useState } from 'react';
import { ThemeToggle } from '../components/ThemeProvider';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { VideoFeed } from '../components/VideoFeed';
import HistoricoLotes from '../components/historico/HistoricoLotes';
import { ConfigurationModal } from '../components/ConfigurationModal';
import { FiSettings, FiMonitor, FiServer } from 'react-icons/fi';

const SERVER_IP = import.meta.env.VITE_SERVER_IP || '127.0.0.1';

// O nosso mapeamento central. Adicionar a Maquina 03 no futuro será apenas adicionar uma linha aqui!
const AVAILABLE_MACHINES = [
  { id: 'Maquina_1', port: Number(import.meta.env.VITE_PORT_MAQUINA_01) || 8036, name: 'Maquina 1' },
  { id: 'Maquina_2', port: Number(import.meta.env.VITE_PORT_MAQUINA_02) || 8037, name: 'Maquina 2' },
];

export const DashboardPage: React.FC = () => {
  const [selectedMachine, setSelectedMachine] = useState(AVAILABLE_MACHINES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // A URL do vídeo muda dinamicamente consoante a máquina selecionada
  const streamUrl = `http://${SERVER_IP}:${selectedMachine.port}/api/v1/video_feed/local`;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-background-primary transition-colors duration-700">
      
      
      <header className="flex items-center justify-between mb-8 bg-white/50 dark:bg-black/30 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center">
          <img src="/icon.png" alt="IA North Logo" className="h-10 w-10 mr-4"/>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary drop-shadow-sm">
              IA North <span className="text-blue-500 font-light">| Painel</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-text-secondary font-medium">
              Sistema de Contagem de vergalhões
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          
          
          <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
            <FiServer className="text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">A Gerir:</span>
            <select 
              value={selectedMachine.id}
              onChange={(e) => {
                const machine = AVAILABLE_MACHINES.find(m => m.id === e.target.value);
                if (machine) setSelectedMachine(machine);
              }}
              className="bg-white dark:bg-background-secondary border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 font-bold cursor-pointer"
            >
              {AVAILABLE_MACHINES.map(m => (
                <option key={m.id} value={m.id}>{m.name} (Porta {m.port})</option>
              ))}
            </select>
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700"></div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-4 py-2 rounded-lg bg-white/80 dark:bg-background-secondary text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-gray-700 shadow-sm flex items-center font-semibold"
          >
            <FiSettings className="w-5 h-5 mr-2" />
            Configurar {selectedMachine.name}
          </button>
        
          <ThemeToggle />
        </div>
      </header>

     
      <main className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fadeIn">
          <div className="lg:col-span-3 space-y-4 min-h-[60vh]">
            
            <div className="bg-white/70 dark:bg-background-secondary/70 p-4 rounded-lg border border-gray-200 dark:border-background-tertiary flex items-center space-x-3 shadow-sm">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FiMonitor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-text-primary">
                Câmara ao Vivo - {selectedMachine.name}
              </h3>
            </div>

            <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 dark:border-gray-600 bg-black flex items-center justify-center min-h-[400px]">
              
              <VideoFeed streamUrl={streamUrl} />
            </div>
          </div>
          <div className="lg:col-span-2">
            
            <AnalysisPanel cameraId={selectedMachine.id} />
          </div>
        </div>

        <HistoricoLotes activeMachineId={selectedMachine.id} />
      </main>

      <footer className="text-center mt-12 mb-4 text-gray-500 dark:text-text-tertiary text-sm font-medium">
        <p>© 2026 Desenvolvido por IANorth Tecnologia.</p>
      </footer>

      
      <ConfigurationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        localMachineId={selectedMachine.id} 
        localApiPort={selectedMachine.port} 
      />     
    </div>
  );
};

export default DashboardPage;