import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysisService';
import type { AnalysisData } from '../services/analysisService';

interface UseAnalysisOptions {
  targetCount: number;
  useSimulation?: boolean;
  cameraId?: string;
}
export const useAnalysisData = ({ targetCount, useSimulation = true, cameraId }: UseAnalysisOptions) => {
  const [data, setData] = useState<AnalysisData>({
    currentCount: 0,
    targetCount,
    status: 'contando',
    batchId: cameraId ?? 'LOTE-A4B8',
  });

  // Sempre que targetCount, useSimulation ou cameraId mudam, reinicia-se a análise
  useEffect(() => {
    let intervalId: number;

    // quando a câmera muda, reiniciamos o estado da análise para a nova câmera
    setData(prev => ({
      ...prev,
      currentCount: 0,
      targetCount,
      status: 'contando',
      batchId: cameraId ?? prev.batchId,
    }));

    const handleAnalysisData = (newData: AnalysisData) => {
      setData(prevData => {
        const updatedData = { ...prevData, ...newData };

        if (updatedData.currentCount >= targetCount) {
          updatedData.status = 'concluido';
          updatedData.currentCount = targetCount;

          if (intervalId) {
            clearInterval(intervalId);
          }
        }

        return updatedData;
      });
    };

    if (useSimulation) {
      intervalId = analysisService.simulateAnalysis(handleAnalysisData, targetCount);
    } else {
      // conectar para receber dados para a câmera selecionada
      analysisService.connect();
      analysisService.onMessage(handleAnalysisData);
    }

    return () => {
      if (useSimulation && intervalId) {
        clearInterval(intervalId);
      } else {
        analysisService.disconnect();
      }
    };
  }, [targetCount, useSimulation, cameraId]);

  // Log de debug: avisa quando a câmera selecionada muda
  useEffect(() => {
    if (cameraId) {
      console.log(`[useAnalysisData] cameraId mudou para: ${cameraId}`);
    } else {
      console.log('[useAnalysisData] cameraId é undefined');
    }
  }, [cameraId]);

  // Quando a análise é concluída, após um tempo, muda o status para ocioso
  useEffect(() => {
    if (data.status === 'concluido' && !useSimulation) {
      const timeoutId = setTimeout(() => {
        setData(prev => ({
          ...prev,
          currentCount: 0,
          status: 'ocioso',
        }));
      }, 5000); // 5 segundos antes de mudar para ocioso

      return () => clearTimeout(timeoutId);
    }
  }, [data.status, useSimulation]);

  // Calcula a porcentagem de conclusão
  const percentage = Math.round((data.currentCount / data.targetCount) * 100);

  return {
    currentCount: data.currentCount,
    targetCount: data.targetCount,
    status: data.status,
    batchId: data.batchId,
    percentage,
    isComplete: data.status === 'concluido',
  };
};
