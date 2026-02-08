import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from './vectorDatabaseData';

interface SearchLatencyChartProps {
  data: ChartDataPoint[];
}

export default function SearchLatencyChart({ data }: SearchLatencyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Latency (ms)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="db" />
            <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="latency" fill="#10b981" name="Search Latency" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
