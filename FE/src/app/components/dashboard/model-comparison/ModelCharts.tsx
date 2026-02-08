import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';

interface ModelChartsProps {
  radarData: any[];
  tradeoffData: any[];
}

export default function ModelCharts({ radarData, tradeoffData }: ModelChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 1]} />
              <Radar name="BGE-M3" dataKey="BGE-M3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="mE5-large" dataKey="mE5-large" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="LaBSE" dataKey="LaBSE" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="mUSE" dataKey="mUSE" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Accuracy vs Speed Tradeoff */}
      <Card>
        <CardHeader>
          <CardTitle>Accuracy vs Speed Trade-off</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="speed" 
                name="Latency" 
                unit="ms"
                label={{ value: 'Latency (ms)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="accuracy" 
                name="Accuracy" 
                unit="%"
                domain={[75, 100]}
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis type="number" dataKey="size" range={[100, 1000]} name="Memory" unit="MB" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Models" data={tradeoffData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Bubble size represents memory usage
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
