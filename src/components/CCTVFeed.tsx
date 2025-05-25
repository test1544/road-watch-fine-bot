
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Wifi, WifiOff } from 'lucide-react';

const CCTVFeed = ({ feedId, isActive }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastDetection, setLastDetection] = useState(null);

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
    // Simulate detection activity
    if (isActive && isConnected) {
      const detectionInterval = setInterval(() => {
        if (Math.random() > 0.8) {
          setLastDetection(new Date());
        }
      }, 2000);

      return () => clearInterval(detectionInterval);
    }
  }, [isActive, isConnected]);

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
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
          {isConnected ? (
            <>
              {/* Simulated video feed background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 opacity-50" />
              
              {/* Detection overlay */}
              {lastDetection && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  ML Processing...
                </div>
              )}
              
              {/* Simulated road/traffic scene */}
              <div className="text-slate-400 text-sm">
                📹 Live Traffic Feed
                <div className="text-xs mt-1">Junction {feedId} - Main Road</div>
              </div>
              
              {/* Detection indicators */}
              {isActive && (
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="License Plate Detection" />
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Vehicle Detection" />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Helmet Detection" />
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
        
        {lastDetection && (
          <div className="mt-2 text-xs text-slate-400">
            Last detection: {lastDetection.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CCTVFeed;
