import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, AlertTriangle, Clock, Car, Shield, Users, Zap } from 'lucide-react';
import ViolationAlert from '@/components/ViolationAlert';
import CCTVFeed from '@/components/CCTVFeed';
import ViolationHistory from '@/components/ViolationHistory';
import StatisticsPanel from '@/components/StatisticsPanel';

const Index = () => {
  const [violations, setViolations] = useState([]);
  const [isSystemActive, setIsSystemActive] = useState(true);

  // Mock real-time violation detection
  useEffect(() => {
    const mockViolations = [
      { id: 1, type: 'helmetless', plate: 'ABC-1234', location: 'Camera 1', timestamp: new Date(), confidence: 95 },
      { id: 2, type: 'overspeeding', plate: 'XYZ-5678', location: 'Camera 2', timestamp: new Date(), confidence: 87 },
      { id: 3, type: 'red_light', plate: 'DEF-9012', location: 'Camera 3', timestamp: new Date(), confidence: 92 },
    ];

    const interval = setInterval(() => {
      if (isSystemActive && Math.random() > 0.7) {
        const newViolation = {
          id: Date.now(),
          type: ['helmetless', 'overspeeding', 'red_light', 'triple_riding'][Math.floor(Math.random() * 4)],
          plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
          location: `Camera ${Math.floor(1 + Math.random() * 6)}`,
          timestamp: new Date(),
          confidence: Math.floor(80 + Math.random() * 20)
        };
        setViolations(prev => [newViolation, ...prev.slice(0, 9)]);
      }
    }, 3000);

    setViolations(mockViolations);
    return () => clearInterval(interval);
  }, [isSystemActive]);

  // Handle ML-detected violations
  const handleViolationDetected = (violation: any) => {
    console.log('New violation detected:', violation);
    setViolations(prev => [violation, ...prev.slice(0, 9)]);
  };

  const getViolationIcon = (type) => {
    switch (type) {
      case 'helmetless': return <Shield className="w-4 h-4" />;
      case 'overspeeding': return <Zap className="w-4 h-4" />;
      case 'red_light': return <AlertTriangle className="w-4 h-4" />;
      case 'triple_riding': return <Users className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getViolationColor = (type) => {
    switch (type) {
      case 'helmetless': return 'destructive';
      case 'overspeeding': return 'destructive';
      case 'red_light': return 'destructive';
      case 'triple_riding': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Camera className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">AI Traffic Violation Detection System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isSystemActive ? "default" : "secondary"} className="px-3 py-1">
              {isSystemActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <Button 
              onClick={() => setIsSystemActive(!isSystemActive)}
              variant={isSystemActive ? "destructive" : "default"}
            >
              {isSystemActive ? "Stop System" : "Start System"}
            </Button>
          </div>
        </div>

        {/* System Status Alert */}
        {!isSystemActive && (
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI traffic violation detection system is currently inactive. Click "Start System" to begin monitoring.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Panel */}
        <StatisticsPanel violations={violations} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live CCTV Feeds with ML Integration */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>AI-Powered CCTV Feeds</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((feedId) => (
                <CCTVFeed 
                  key={feedId} 
                  feedId={feedId} 
                  isActive={isSystemActive}
                  onViolationDetected={handleViolationDetected}
                />
              ))}
            </div>
          </div>

          {/* Recent Violations */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Recent Violations</span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {violations.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="p-4 text-center text-slate-400">
                    No violations detected
                  </CardContent>
                </Card>
              ) : (
                violations.map((violation) => (
                  <ViolationAlert key={violation.id} violation={violation} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Violation History */}
        <ViolationHistory violations={violations} />
      </div>
    </div>
  );
};

export default Index;
