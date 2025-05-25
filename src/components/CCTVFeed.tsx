
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
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isModelReady, isProcessing, processFrame } = useMLDetection();

  // Simulate different traffic scenes for each camera
  const getTrafficScene = (feedId: number, frame: number) => {
    const scenes = [
      '🚗🏍️🚙', // Cars and motorcycles
      '🚦🚗🚗🏍️', // Traffic light with vehicles
      '🏍️🏍️🏍️🚗', // Multiple motorcycles
      '🚛🚗🚙🏍️', // Mixed traffic
      '🚗🚕🏍️', // City traffic
    ];
    
    const vehicles = ['🚗', '🏍️', '🚙', '🚕', '🚛'];
    const randomVehicles = Array.from({length: 3}, () => 
      vehicles[Math.floor(Math.random() * vehicles.length)]
    ).join('');
    
    return scenes[feedId % scenes.length] || randomVehicles;
  };

  useEffect(() => {
    // Simulate connection status changes (rarely)
    const interval = setInterval(() => {
      if (Math.random() > 0.98) {
        setIsConnected(prev => !prev);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate frame updates
    if (isActive && isConnected) {
      const frameInterval = setInterval(() => {
        setCurrentFrame(prev => prev + 1);
      }, 2000);

      return () => clearInterval(frameInterval);
    }
  }, [isActive, isConnected]);

  useEffect(() => {
    // Simulate video processing and ML detection
    if (isActive && isConnected && isModelReady) {
      const processingInterval = setInterval(async () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Create mock image data for processing
            const imageData = ctx.createImageData(320, 180);
            const result = await processFrame(imageData, `camera_${feedId}`);
            
            if (result && result.detections.length > 0) {
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
      }, 3000);

      return () => clearInterval(processingInterval);
    }
  }, [isActive, isConnected, isModelReady, feedId, processFrame, onViolationDetected]);

  const currentScene = getTrafficScene(feedId, currentFrame);
  const junctionTypes = ['Main St & 5th Ave', 'Highway Exit 12', 'School Zone', 'Commercial District', 'Residential Area', 'City Center'];

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
              
              {/* Simulated video feed with traffic */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
                {/* Road background */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gray-700 opacity-80"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1/3 bg-yellow-400 opacity-60"></div>
                
                {/* Traffic scene */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {currentScene}
                </div>
                
                {/* Traffic light for some cameras */}
                {feedId % 2 === 0 && (
                  <div className="absolute top-2 right-2 text-red-500 text-lg">
                    🚦
                  </div>
                )}
              </div>
              
              {/* ML Processing indicator */}
              {isProcessing && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Analyzing...</span>
                </div>
              )}
              
              {!isModelReady && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Loading Model...
                </div>
              )}
              
              {/* Live indicator */}
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                <span>LIVE</span>
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
              
              {/* Location label */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {junctionTypes[feedId - 1] || `Junction ${feedId}`}
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-center">
              <WifiOff className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm">Connection Lost</div>
              <div className="text-xs text-slate-600 mt-1">Reconnecting...</div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-slate-400 flex justify-between items-center">
          <span>Model: {isModelReady ? 'YOLOv8 Ready' : 'Loading...'}</span>
          {isConnected && (
            <span className="text-green-400">
              Frame #{currentFrame}
            </span>
          )}
          {isProcessing && <span className="text-blue-400">Processing...</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default CCTVFeed;
