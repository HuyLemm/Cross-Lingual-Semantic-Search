import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from './vectorDatabaseData';

interface StorageCostChartProps {
  data: ChartDataPoint[];
}

export default function StorageCostChart({ data }: StorageCostChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Cost (GB)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Storage (GB)', position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="db" type="category" />
            <Tooltip />
            <Bar dataKey="cost" fill="#8b5cf6" name="Storage Cost" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
