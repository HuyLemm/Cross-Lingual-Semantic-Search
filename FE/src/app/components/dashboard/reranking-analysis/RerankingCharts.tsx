import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RerankingChartsProps {
  metricsComparison: any[];
  scoreImprovementData: any[];
}

export default function RerankingCharts({ metricsComparison, scoreImprovementData }: RerankingChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Before vs After Metrics</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" angle={-15} textAnchor="end" height={80} />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="before" fill="#94a3b8" name="Before Reranking" />
              <Bar dataKey="after" fill="#3b82f6" name="After Reranking" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Score Improvement by Position</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreImprovementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" label={{ value: 'Initial Rank Position', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="before" stroke="#94a3b8" strokeWidth={2} name="Before" />
              <Line type="monotone" dataKey="after" stroke="#10b981" strokeWidth={2} name="After" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
