
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, AlertTriangle, Users, TrendingUp, Clock } from 'lucide-react';

const StatisticsPanel = ({ violations }) => {
  const getViolationStats = () => {
    const stats = {
      helmetless: 0,
      overspeeding: 0,
      red_light: 0,
      triple_riding: 0,
      total: violations.length
    };

    violations.forEach(violation => {
      if (stats.hasOwnProperty(violation.type)) {
        stats[violation.type]++;
      }
    });

    return stats;
  };

  const stats = getViolationStats();

  const statCards = [
    {
      title: "Total Violations",
      value: stats.total,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Helmetless",
      value: stats.helmetless,
      icon: <Shield className="w-4 h-4" />,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Overspeeding",
      value: stats.overspeeding,
      icon: <Zap className="w-4 h-4" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Red Light",
      value: stats.red_light,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Triple Riding",
      value: stats.triple_riding,
      icon: <Users className="w-4 h-4" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsPanel;
