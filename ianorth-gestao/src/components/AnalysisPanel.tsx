import React from 'react';
import { FiBarChart2, FiCheckCircle, FiClock, FiCpu, FiHash, FiLoader } from 'react-icons/fi';
import { useAnalysisData } from '../hooks/useAnalysisData'; 

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; className?: string }> = ({ icon, label, value, className = '' }) => (
  <div className={`bg-white/60 dark:bg-black/20 p-4 rounded-lg flex items-center border border-gray-200/50 dark:border-white/10 backdrop-blur-sm ${className}`}>
    <div className="mr-4 text-accent-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white drop-shadow-sm">{value}</p>
    </div>
  </div>
);

export const AnalysisPanel: React.FC<{ cameraId: string | null }> = ({ cameraId }) => {
  const { data, isLoading, isConnected } = useAnalysisData(cameraId);

  const statusInfo = {
    'Aguardando': { text: 'AGUARDANDO', color: 'text-gray-600 dark:text-gray-300', icon: <FiCpu size={24} /> },
    'Em Andamento': { text: 'EM ANDAMENTO', color: 'text-yellow-600 dark:text-yellow-400', icon: <FiClock size={24} /> },
    'Concluído': { text: 'CONCLUÍDO', color: 'text-green-700 dark:text-green-400', icon: <FiCheckCircle size={24} /> },
    'Cooldown': { text: 'PROCESSANDO...', color: 'text-blue-600 dark:text-blue-400', icon: <FiLoader size={24} className="animate-spin" /> },
  };
  
  if (isLoading || !data) {
    return (
      <div className="bg-white/80 dark:bg-background-secondary/80 backdrop-blur-md border-2 border-gray-200 dark:border-background-tertiary rounded-xl shadow-lg p-6 h-full text-gray-900 dark:text-text-primary transition-colors duration-500">
        <div className="flex items-center mb-6">
          <FiBarChart2 className="text-accent-primary mr-3" size={22} />
          <h2 className="text-lg font-bold">Análise da Contagem</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
          <FiLoader className="animate-spin text-4xl text-accent-primary mb-4" />
          <p className="text-gray-500 font-medium">
            {!cameraId ? 'Selecione a câmera Edge para iniciar.' : (isConnected ? 'Aguardando dados da IA...' : 'Conectando ao Motor...')}
          </p>
        </div>
      </div>
    );
  }

  const { status, currentCount, targetCount, progress, loteId } = data;
  const currentStatusInfo = statusInfo[status] || statusInfo['Aguardando']; 

  const isSafe = status === 'Concluído' || status === 'Cooldown';
  const isIdle = status === 'Aguardando' || currentCount === 0;
  const isDanger = !isSafe && !isIdle;
  
  const progressBarColor = isSafe ? 'bg-green-500' : (isDanger ? 'bg-red-500' : 'bg-blue-500');
  const numberColor = isSafe ? 'text-green-700 dark:text-green-400' : (isDanger ? 'text-red-700 dark:text-red-400' : 'text-accent-secondary');

  
  const getPanelAura = () => {
    if (isIdle) return 'bg-white/80 dark:bg-background-secondary/80 border-gray-200 dark:border-background-tertiary';

    if (isDanger) return 'bg-red-50 dark:bg-red-950/50 border-red-500 shadow-[0_0_60px_rgba(220,38,38,0.5)] animate-pulse';

    if (isSafe) return 'bg-green-50 dark:bg-green-950/50 border-green-500 shadow-[0_0_60px_rgba(22,163,74,0.5)]';
    
    return 'bg-white/80 dark:bg-background-secondary/80 border-gray-200 dark:border-background-tertiary';
  };

  return (
    <div className={`backdrop-blur-md border-4 rounded-xl p-6 h-full text-gray-900 dark:text-text-primary transition-all duration-500 ${getPanelAura()}`}>
      <div className="flex items-center mb-6">
        <FiBarChart2 className={`mr-3 ${isDanger ? 'text-red-600 dark:text-red-400' : isSafe ? 'text-green-600 dark:text-green-400' : 'text-accent-primary'}`} size={24} />
        <h2 className="text-xl font-bold drop-shadow-sm">Análise da Contagem</h2>
      </div>
      
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard 
            icon={<FiHash size={24}/>} 
            label="ID do Lote" 
            value={loteId?.toString() || 'N/A'} 
          />
          <InfoCard 
            icon={currentStatusInfo.icon} 
            label="Status" 
            value={currentStatusInfo.text}
            className={currentStatusInfo.color}
          />
        </div>

        <div className={`text-center p-6 rounded-lg border-2 transition-colors duration-500 ${isDanger ? 'bg-red-100/50 dark:bg-red-900/30 border-red-300 dark:border-red-700/50' : isSafe ? 'bg-green-100/50 dark:bg-green-900/30 border-green-300 dark:border-green-700/50' : 'bg-gray-50/80 dark:bg-black/20 border-gray-200 dark:border-white/10'}`}>
          <p className="text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider font-bold">Contagem Atual</p>
          <p className={`text-7xl font-black my-3 drop-shadow-lg transition-colors duration-300 ${numberColor}`}>
            {currentCount}
          </p>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">de {targetCount} peças</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Progresso</p>
            <p className={`text-xl font-black ${numberColor}`}>{Math.round(progress)}%</p>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-800 rounded-full h-4 shadow-inner overflow-hidden">
            <div 
              className={`${progressBarColor} h-4 rounded-full transition-all duration-500 ease-out shadow-md`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {status === 'Concluído' && (
          <div className="bg-green-200 dark:bg-green-800/80 border-2 border-green-500 text-green-900 dark:text-green-100 text-center p-4 rounded-xl flex items-center justify-center animate-pulse shadow-lg">
            <FiCheckCircle className="mr-3 w-7 h-7"/>
            <p className="font-bold text-xl tracking-wide uppercase drop-shadow-sm">Fardo Completo! Liberado.</p>
          </div>
        )}
      </div>
    </div>
  );
};