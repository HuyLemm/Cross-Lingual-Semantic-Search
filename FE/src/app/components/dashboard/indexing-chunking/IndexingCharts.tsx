import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IndexingChartsProps {
  buildTimeData: Array<{ strategy: string; time: number }>;
  queryLatencyData: Array<{ strategy: string; latency: number }>;
}

export default function IndexingCharts({ buildTimeData, queryLatencyData }: IndexingChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Index Build Time */}
      <Card>
        <CardHeader>
          <CardTitle>Index Build Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={buildTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strategy" />
              <YAxis label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="time" fill="#3b82f6" name="Build Time" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Query Latency */}
      <Card>
        <CardHeader>
          <CardTitle>Query Latency Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={queryLatencyData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Latency (ms)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="strategy" type="category" />
              <Tooltip />
              <Bar dataKey="latency" fill="#10b981" name="Query Latency" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
