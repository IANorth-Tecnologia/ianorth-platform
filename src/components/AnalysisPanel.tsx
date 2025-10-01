
import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiCheckCircle, FiClock, FiCpu, FiHash } from 'react-icons/fi'; 

interface AnalysisData {
  currentCount: number;
  targetCount: number;
  status: 'contando' | 'concluido' | 'ocioso';
  batchId: string;
}

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

export const AnalysisPanel: React.FC = () => {
  const TARGET_COUNT = 350;

  const [data, setData] = useState<AnalysisData>({
    currentCount: 0,
    targetCount: TARGET_COUNT,
    status: 'contando',
    batchId: 'LOTE-A4B8',
  });

  useEffect(() => {
    if (data.status !== 'contando' || data.currentCount >= TARGET_COUNT) {
      if (data.currentCount >= TARGET_COUNT) {
          setData(prev => ({ ...prev, status: 'concluido' }));
      }
      return;
    }

    const interval = setInterval(() => {
      setData(prevData => {
        const increment = Math.floor(Math.random() * 5) + 1;
        const newCount = prevData.currentCount + increment;
        
        if (newCount >= TARGET_COUNT) {
          clearInterval(interval);
          return { ...prevData, currentCount: TARGET_COUNT, status: 'concluido' };
        }
        
        return { ...prevData, currentCount: newCount };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [data.status, data.currentCount]);

  const percentage = Math.round((data.currentCount / data.targetCount) * 100);

  const statusInfo = {
    contando: { text: 'EM ANDAMENTO', color: 'text-yellow-400', icon: <FiClock size={24} /> },
    concluido: { text: 'CONCLUÍDO', color: 'text-green-400', icon: <FiCheckCircle size={24} /> },
    ocioso: { text: 'OCIOSO', color: 'text-gray-400', icon: <FiCpu size={24} /> },
  };
  
  const progressBarColor = data.status === 'concluido' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className="bg-white/70 dark:bg-background-secondary/70 backdrop-blur-sm border border-gray-200 dark:border-background-tertiary rounded-xl shadow-lg p-6 h-full text-gray-900 dark:text-text-primary">
      <div className="flex items-center mb-6">
        <FiBarChart2 className="text-accent-primary mr-3" size={22} />
        <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">
          Análise da Contagem
        </h2>
      </div>
      
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard 
            icon={<FiHash size={24}/>} 
            label="ID do Lote" 
            value={data.batchId} 
          />
          <InfoCard 
            icon={statusInfo[data.status].icon} 
            label="Status" 
            value={statusInfo[data.status].text}
            className={statusInfo[data.status].color}
          />
        </div>

        <div className="text-center bg-gray-50 dark:bg-background-primary p-6 rounded-lg border border-gray-200 dark:border-background-tertiary">
          <p className="text-gray-600 dark:text-text-secondary text-sm uppercase tracking-wider">Contagem Atual</p>
          <p className="text-6xl font-bold my-2 text-accent-secondary">
            {data.currentCount}
          </p>
          <p className="text-gray-500 dark:text-text-tertiary">de {data.targetCount} peças</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-accent-secondary">Progresso</p>
            <p className="text-lg font-semibold text-accent-secondary">{percentage}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-background-primary rounded-full h-2.5">
            <div 
              className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500 ease-out`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {data.status === 'concluido' && (
          <div className="bg-status-success/10 border border-status-success/30 text-status-success text-center p-3 rounded-lg flex items-center justify-center">
            <FiCheckCircle className="mr-2"/>
            <p className="font-semibold text-sm">Lote concluído com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
};

