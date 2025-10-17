import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysisService';
import type { AnalysisData } from '../services/analysisService';


// O hook agora só precisa do ID da câmera para funcionar.
//
export const useAnalysisData = (cameraId: string | null) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isConnected, setIsConnected] = useState(false);  


  useEffect(() => {
        if (!cameraId){
            setData(null);
            setIsConnected(false);
            return;
        }

        analysisService.connect(cameraId);
        setIsConnected(true);

        const handleNewData = (newData: AnalysisData) => {
            setData(newData);
        };
        analysisService.onMessage(handleNewData);

        return () => {
            analysisService.disconnect();
            setIsConnected(false);
        };
    }, [cameraId]);


  return {
        data,
        isConnected,
        isLoading: !data && isConnected,
  };
};
