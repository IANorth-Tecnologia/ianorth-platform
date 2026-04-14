import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysisService';
import type { AnalysisData } from '../services/analysisService';

export const useAnalysisData = (cameraId: string | null) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isConnected, setIsConnected] = useState(false);  

  useEffect(() => {
    if (!cameraId) {
      setData(null);
      setIsConnected(false);
      return;
    }

   
    analysisService.connect(cameraId);
    setIsConnected(true);

    const handleNewData = (newData: AnalysisData) => {
      
      if (newData.cameraId === cameraId) {
        setData(newData);
      }
    };
    
    analysisService.onMessage(handleNewData);

    return () => {
      analysisService.removeListener(handleNewData);
     
      analysisService.disconnect(cameraId); 
      setIsConnected(false);
    };
  }, [cameraId]);

  return {
    data,
    isConnected,
    isLoading: !data && isConnected,
  };
};