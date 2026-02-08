import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LatencyBreakdownProps {
  latencyCostData: any[];
}

export default function LatencyBreakdown({ latencyCostData }: LatencyBreakdownProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Latency Breakdown</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={latencyCostData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="latency" fill="#8b5cf6" name="Stage Latency" />
            <Bar dataKey="cumulative" fill="#f59e0b" name="Cumulative Latency" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Embedding</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">42ms</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Initial Retrieval</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">8ms</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Reranking</p>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">78ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
