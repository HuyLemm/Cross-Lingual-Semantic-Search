import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScalabilityDataPoint } from './vectorDatabaseData';

interface ScalabilityChartProps {
  data: ScalabilityDataPoint[];
}

export default function ScalabilityChart({ data }: ScalabilityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scalability: Latency vs Dataset Size</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="vectors" 
              label={{ value: 'Number of Vectors', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Query Latency (ms)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="FAISS" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="Milvus" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Qdrant" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="Weaviate" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
