import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysisService';
import type { AnalysisData } from '../services/analysisService';

interface UseAnalysisOptions {
  targetCount: number;
  useSimulation?: boolean;
}

export const useAnalysisData = ({ targetCount, useSimulation = true }: UseAnalysisOptions) => {
  const [data, setData] = useState<AnalysisData>({
    currentCount: 0,
    targetCount,
    status: 'contando',
    batchId: 'LOTE-A4B8',
  });

  useEffect(() => {
    let intervalId: number;

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
  }, [targetCount, useSimulation]);

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
