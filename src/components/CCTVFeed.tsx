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
  const [animationFrame, setAnimationFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isModelReady, isProcessing, processFrame } = useMLDetection();

  // Simulate different traffic scenarios for each camera
  const getTrafficScenario = (feedId: number, frame: number) => {
    const scenarios = [
      {
        road: 'intersection',
        vehicles: [
          { type: '🚗', x: 20 + (frame * 2) % 100, y: 60, hasHelmet: true },
          { type: '🏍️', x: 80 - (frame * 3) % 80, y: 40, hasHelmet: false },
          { type: '🚙', x: 40 + (frame * 1.5) % 60, y: 70, hasHelmet: true }
        ],
        trafficLight: frame % 120 < 40 ? '🔴' : frame % 120 < 80 ? '🟡' : '🟢'
      },
      {
        road: 'highway',
        vehicles: [
          { type: '🚗', x: 10 + (frame * 4) % 120, y: 50, hasHelmet: true },
          { type: '🏍️', x: 30 + (frame * 6) % 100, y: 45, hasHelmet: false },
          { type: '🚛', x: 5 + (frame * 2) % 90, y: 65, hasHelmet: true }
        ],
        trafficLight: null
      },
      {
        road: 'school_zone',
        vehicles: [
          { type: '🚗', x: 25 + (frame * 1) % 70, y: 55, hasHelmet: true },
          { type: '🏍️', x: 60 + (frame * 5) % 80, y: 35, hasHelmet: false },
          { type: '🏍️', x: 35 + (frame * 3) % 90, y: 55, hasHelmet: false }
        ],
        trafficLight: '🚸'
      }
    ];
    
    return scenarios[feedId % scenarios.length] || scenarios[0];
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
        setAnimationFrame(prev => prev + 1);
      }, 500); // Faster updates for smoother animation

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

  const currentScenario = getTrafficScenario(feedId, animationFrame);
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
              
              {/* Simulated realistic video feed */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-300 to-gray-600">
                {/* Sky and background */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-200 to-blue-300 opacity-80"></div>
                
                {/* Buildings silhouette */}
                <div className="absolute top-1/4 left-0 right-0 h-1/4 bg-gray-700 opacity-60" style={{
                  clipPath: 'polygon(0 100%, 20% 80%, 40% 85%, 60% 70%, 80% 90%, 100% 75%, 100% 100%)'
                }}></div>
                
                {/* Road surface */}
                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gray-600"></div>
                
                {/* Road markings */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-1 bg-yellow-300"></div>
                  ))}
                </div>
                
                {/* Traffic light */}
                {currentScenario.trafficLight && (
                  <div className="absolute top-1/4 right-4 text-2xl">
                    {currentScenario.trafficLight}
                  </div>
                )}
                
                {/* Animated vehicles */}
                {currentScenario.vehicles.map((vehicle, index) => (
                  <div
                    key={index}
                    className="absolute text-2xl transition-all duration-500 ease-linear"
                    style={{
                      left: `${vehicle.x}%`,
                      top: `${vehicle.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {vehicle.type}
                    {/* Helmet detection indicator */}
                    {vehicle.type === '🏍️' && !vehicle.hasHelmet && (
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse"></div>
                    )}
                  </div>
                ))}
                
                {/* Speed detection box for some vehicles */}
                {animationFrame % 100 < 10 && (
                  <div className="absolute top-1/2 left-1/4 bg-red-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                    SPEED: 85 km/h
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
              
              {/* Detection bounding boxes */}
              {isActive && isModelReady && animationFrame % 80 < 20 && (
                <>
                  <div className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20" 
                       style={{
                         left: '25%',
                         top: '45%',
                         width: '8%',
                         height: '12%'
                       }}>
                    <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
                      No Helmet 92%
                    </div>
                  </div>
                  
                  <div className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20" 
                       style={{
                         left: '60%',
                         top: '55%',
                         width: '12%',
                         height: '8%'
                       }}>
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded">
                      Vehicle 98%
                    </div>
                  </div>
                </>
              )}
              
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
