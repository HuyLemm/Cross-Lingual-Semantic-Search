import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RecallDataPoint } from './vectorDatabaseData';

interface RecallComparisonChartProps {
  data: RecallDataPoint[];
}

export default function RecallComparisonChart({ data }: RecallComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recall@K Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="k" label={{ value: 'Top-K', position: 'insideBottom', offset: -5 }} />
            <YAxis domain={[0.6, 1]} />
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
