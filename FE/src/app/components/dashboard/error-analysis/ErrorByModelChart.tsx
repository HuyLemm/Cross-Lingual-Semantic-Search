import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ErrorByModel } from './errorAnalysisData';

interface ErrorByModelChartProps {
  data: ErrorByModel[];
}

export default function ErrorByModelChart({ data }: ErrorByModelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Frequency by Model</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis label={{ value: 'Error Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="wrongLang" stackId="a" fill="#ef4444" name="Wrong Language" />
            <Bar dataKey="semantic" stackId="a" fill="#f97316" name="Semantic Mismatch" />
            <Bar dataKey="partial" stackId="a" fill="#f59e0b" name="Partial Context" />
            <Bar dataKey="keyword" stackId="a" fill="#eab308" name="Keyword Bias" />
            <Bar dataKey="ranking" stackId="a" fill="#84cc16" name="Ranking Error" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
