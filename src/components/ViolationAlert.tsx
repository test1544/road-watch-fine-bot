
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Zap, AlertTriangle, Users, Clock, MapPin, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ViolationAlert = ({ violation }) => {
  const getViolationDetails = (type) => {
    switch (type) {
      case 'helmetless':
        return { 
          icon: <Shield className="w-4 h-4" />, 
          label: 'Helmetless Driving', 
          fine: 1000,
          color: 'bg-red-500' 
        };
      case 'overspeeding':
        return { 
          icon: <Zap className="w-4 h-4" />, 
          label: 'Overspeeding', 
          fine: 2000,
          color: 'bg-orange-500' 
        };
      case 'red_light':
        return { 
          icon: <AlertTriangle className="w-4 h-4" />, 
          label: 'Red Light Violation', 
          fine: 5000,
          color: 'bg-red-600' 
        };
      case 'triple_riding':
        return { 
          icon: <Users className="w-4 h-4" />, 
          label: 'Triple Riding', 
          fine: 1500,
          color: 'bg-purple-500' 
        };
      default:
        return { 
          icon: <AlertTriangle className="w-4 h-4" />, 
          label: 'Unknown Violation', 
          fine: 1000,
          color: 'bg-gray-500' 
        };
    }
  };

  const details = getViolationDetails(violation.type);

  const sendFineNotification = () => {
    toast({
      title: "Fine Notification Sent",
      description: `Fine of ₹${details.fine} sent to owner of ${violation.plate}`,
    });
  };

  return (
    <Card className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${details.color}`}>
              {details.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white">{details.label}</h3>
                <Badge variant="outline" className="text-xs">
                  {violation.confidence}% confidence
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{violation.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{violation.timestamp.toLocaleTimeString()}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-lg font-bold text-white">{violation.plate}</div>
            <div className="text-sm text-green-400">Fine: ₹{details.fine}</div>
            <Button 
              size="sm" 
              onClick={sendFineNotification}
              className="flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Fine</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViolationAlert;
