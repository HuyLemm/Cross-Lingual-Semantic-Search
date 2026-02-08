import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from './vectorDatabaseData';

interface InsertSpeedChartProps {
  data: ChartDataPoint[];
}

export default function InsertSpeedChart({ data }: InsertSpeedChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insert Speed (vectors/second)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="db" />
            <YAxis label={{ value: 'Vectors/sec', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="speed" fill="#3b82f6" name="Insert Speed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
