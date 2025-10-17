
import React from 'react';
import { FiBarChart2, FiCheckCircle, FiClock, FiCpu, FiHash, FiLoader } from 'react-icons/fi';
import { useAnalysisData } from '../hooks/useAnalysisData'; 

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; className?: string }> = ({ icon, label, value, className = '' }) => (
  <div className={`bg-white dark:bg-background-secondary p-4 rounded-lg flex items-center border border-gray-200 dark:border-background-tertiary ${className}`}>
    <div className="mr-4 text-accent-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600 dark:text-text-secondary">{label}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-text-primary">{value}</p>
    </div>
  </div>
);

export const AnalysisPanel: React.FC<{ cameraId: string | null }> = ({ cameraId }) => {
  // Removemos a simulação e consumimos os estados de carregamento e erro do hook.
  const { data, isLoading, isConnected } = useAnalysisData(cameraId);

  // As chaves agora correspondem exatamente ao que o backend envia: 'Em Andamento', 'Concluído', 'Aguardando'.
  const statusInfo = {
    'Aguardando': { text: 'AGUARDANDO', color: 'text-gray-400', icon: <FiCpu size={24} /> },
    'Em Andamento': { text: 'EM ANDAMENTO', color: 'text-yellow-400', icon: <FiClock size={24} /> },
    'Concluído': { text: 'CONCLUÍDO', color: 'text-green-400', icon: <FiCheckCircle size={24} /> },
  };
  
  if (isLoading || !data) {
    return (
      <div className="bg-white/70 dark:bg-background-secondary/70 backdrop-blur-sm border border-gray-200 dark:border-background-tertiary rounded-xl shadow-lg p-6 h-full text-gray-900 dark:text-text-primary">
        <div className="flex items-center mb-6">
          <FiBarChart2 className="text-accent-primary mr-3" size={22} />
          <h2 className="text-lg font-bold">Análise da Contagem</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
          <FiLoader className="animate-spin text-4xl text-accent-primary mb-4" />
          <p className="text-text-secondary">
            {!cameraId ? 'Selecione uma câmera para iniciar.' : (isConnected ? 'Aguardando dados...' : 'Conectando...')}
          </p>
        </div>
      </div>
    );
  }

  const { status, currentCount, targetCount, progress, loteId } = data;
  const currentStatusInfo = statusInfo[status] || statusInfo['Aguardando']; // Fallback de segurança
  const progressBarColor = status === 'Concluído' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className="bg-white/70 dark:bg-background-secondary/70 backdrop-blur-sm border border-gray-200 dark:border-background-tertiary rounded-xl shadow-lg p-6 h-full text-gray-900 dark:text-text-primary">
      <div className="flex items-center mb-6">
        <FiBarChart2 className="text-accent-primary mr-3" size={22} />
        <h2 className="text-lg font-bold">Análise da Contagem</h2>
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

        <div className="text-center bg-gray-50 dark:bg-background-primary p-6 rounded-lg border border-gray-200 dark:border-background-tertiary">
          <p className="text-gray-600 dark:text-text-secondary text-sm uppercase tracking-wider">Contagem Atual</p>
          <p className="text-6xl font-bold my-2 text-accent-secondary">
            {currentCount}
          </p>
          <p className="text-gray-500 dark:text-text-tertiary">de {targetCount} peças</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-accent-secondary">Progresso</p>
            <p className="text-lg font-semibold text-accent-secondary">{Math.round(progress)}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-background-primary rounded-full h-2.5">
            <div 
              className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500 ease-out`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {status === 'Concluído' && (
          <div className="bg-status-success/10 border border-status-success/30 text-status-success text-center p-3 rounded-lg flex items-center justify-center">
            <FiCheckCircle className="mr-2"/>
            <p className="font-semibold text-sm">Lote concluído com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
};
