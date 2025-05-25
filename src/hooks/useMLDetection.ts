
import { useState, useEffect, useCallback } from 'react';
import { mlService, ProcessedFrame } from '@/services/MLService';

export const useMLDetection = () => {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDetection, setLastDetection] = useState<ProcessedFrame | null>(null);

  useEffect(() => {
    const initializeModel = async () => {
      const loaded = await mlService.loadModel();
      setIsModelReady(loaded);
    };

    initializeModel();
  }, []);

  const processFrame = useCallback(async (imageData: ImageData, cameraId: string) => {
    if (!isModelReady) return null;
    
    setIsProcessing(true);
    try {
      const result = await mlService.processFrame(imageData, cameraId);
      if (result) {
        setLastDetection(result);
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [isModelReady]);

  return {
    isModelReady,
    isProcessing,
    lastDetection,
    processFrame
  };
};
