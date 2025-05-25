
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ViolationHistory = ({ violations }) => {
  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Violation Type,License Plate,Location,Confidence\n"
      + violations.map(v => `${v.timestamp.toISOString()},${v.type},${v.plate},${v.location},${v.confidence}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "violations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Violation History</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search violations..." 
                className="pl-10 bg-slate-800 border-slate-600 text-white w-64"
              />
            </div>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400">Time</th>
                <th className="text-left py-2 text-slate-400">Violation</th>
                <th className="text-left py-2 text-slate-400">License Plate</th>
                <th className="text-left py-2 text-slate-400">Location</th>
                <th className="text-left py-2 text-slate-400">Confidence</th>
                <th className="text-left py-2 text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {violations.slice(0, 10).map((violation) => (
                <tr key={violation.id} className="border-b border-slate-800">
                  <td className="py-2 text-slate-300">
                    {violation.timestamp.toLocaleString()}
                  </td>
                  <td className="py-2">
                    <Badge variant="destructive" className="capitalize">
                      {violation.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-2 font-mono text-white">{violation.plate}</td>
                  <td className="py-2 text-slate-300">{violation.location}</td>
                  <td className="py-2 text-slate-300">{violation.confidence}%</td>
                  <td className="py-2">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Processed
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViolationHistory;
