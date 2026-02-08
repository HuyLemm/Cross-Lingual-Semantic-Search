import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OverviewChartsProps {
  topKAccuracyData: any[];
  metricsOverTimeData: any[];
  latencyAccuracyData: any[];
  memoryUsageData: any[];
}

export default function OverviewCharts({
  topKAccuracyData,
  metricsOverTimeData,
  latencyAccuracyData,
  memoryUsageData,
}: OverviewChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Top-K Accuracy Comparison</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topKAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="k1" fill="#3b82f6" name="Recall@1" />
              <Bar dataKey="k5" fill="#10b981" name="Recall@5" />
              <Bar dataKey="k10" fill="#8b5cf6" name="Recall@10" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Metrics vs Top-K</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="k" label={{ value: 'Top-K', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mrr" stroke="#3b82f6" name="MRR" strokeWidth={2} />
              <Line type="monotone" dataKey="recall" stroke="#10b981" name="Recall" strokeWidth={2} />
              <Line type="monotone" dataKey="precision" stroke="#f59e0b" name="Precision" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Latency vs Accuracy Trade-off</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="latency" name="Latency" unit="ms" label={{ value: 'Latency (ms)', position: 'insideBottom', offset: -5 }} />
              <YAxis type="number" dataKey="accuracy" name="Accuracy" unit="%" label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Models" data={latencyAccuracyData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Memory Usage per Index (GB)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memoryUsageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Memory (GB)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="index" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="memory" fill="#06b6d4" name="Memory Usage" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
