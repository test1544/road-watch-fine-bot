
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Wifi, WifiOff, Brain } from 'lucide-react';
import { useMLDetection } from '@/hooks/useMLDetection';

interface CCTVFeedProps {
  feedId: number;
  isActive: boolean;
  onViolationDetected?: (violation: any) => void;
}

const CCTVFeed = ({ feedId, isActive, onViolationDetected }: CCTVFeedProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isModelReady, isProcessing, processFrame } = useMLDetection();

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsConnected(prev => !prev);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate video processing and ML detection
    if (isActive && isConnected && isModelReady) {
      const processingInterval = setInterval(async () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Simulate frame capture (in real implementation, this would be from video stream)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const result = await processFrame(imageData, `camera_${feedId}`);
            
            if (result && result.detections.length > 0) {
              // Convert ML detections to violation format
              result.detections.forEach(detection => {
                if (onViolationDetected) {
                  const violation = {
                    id: Date.now() + Math.random(),
                    type: detection.class === 'no_helmet' ? 'helmetless' : 
                          detection.class === 'red_light_crossing' ? 'red_light' :
                          detection.class === 'triple_riding' ? 'triple_riding' : 'overspeeding',
                    plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
                    location: `Camera ${feedId}`,
                    timestamp: new Date(),
                    confidence: detection.confidence,
                    bbox: detection.bbox
                  };
                  onViolationDetected(violation);
                }
              });
            }
          }
        }
      }, 3000); // Process every 3 seconds

      return () => clearInterval(processingInterval);
    }
  }, [isActive, isConnected, isModelReady, feedId, processFrame, onViolationDetected]);

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Camera {feedId}</span>
          </span>
          <div className="flex items-center space-x-1">
            {isConnected ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? "LIVE" : "OFFLINE"}
            </Badge>
            {isModelReady && (
              <Brain className={`w-3 h-3 ${isProcessing ? 'text-yellow-400 animate-pulse' : 'text-green-400'}`} />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
          {isConnected ? (
            <>
              <canvas 
                ref={canvasRef}
                width={320}
                height={180}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: 'none' }}
              />
              
              {/* Simulated video feed background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 opacity-50" />
              
              {/* ML Processing indicator */}
              {isProcessing && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Processing...</span>
                </div>
              )}
              
              {!isModelReady && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Loading ML Model...
                </div>
              )}
              
              {/* Simulated road/traffic scene */}
              <div className="text-slate-400 text-sm">
                📹 Live Traffic Feed
                <div className="text-xs mt-1">Junction {feedId} - Main Road</div>
              </div>
              
              {/* Detection indicators */}
              {isActive && isModelReady && (
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="License Plate Detection" />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Vehicle Detection" />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Helmet Detection" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" title="Traffic Light Detection" />
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500 text-center">
              <WifiOff className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm">Connection Lost</div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-slate-400 flex justify-between">
          <span>Model: {isModelReady ? 'YOLOv8 Ready' : 'Loading...'}</span>
          {isProcessing && <span className="text-blue-400">Processing...</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default CCTVFeed;
