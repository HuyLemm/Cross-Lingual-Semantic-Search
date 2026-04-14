import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type SearchLatencyPoint = {
  database: string;
  latency: number | null | undefined;
};

interface SearchLatencyChartProps {
  data: SearchLatencyPoint[];
}

function isNonEmptyArray(a: any[]) {
  return Array.isArray(a) && a.length > 0;
}

export default function SearchLatencyChart({ data }: SearchLatencyChartProps) {
  const clean = (data || [])
    .map((d) => ({
      database: String(d.database ?? ''),
      latency: d.latency == null ? null : Number(d.latency),
    }))
    .filter((d) => d.database);

  const has = isNonEmptyArray(clean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Latency (ms)</CardTitle>
      </CardHeader>
      <CardContent>
        {!has ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            No latency data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clean}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="database" />
              <YAxis
                label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(3) : '')}
              />
              <Tooltip
                labelFormatter={(label) => `Strategy: ${label}`}
                formatter={(value) => {
                  const v = typeof value === 'number' ? value : Number(value);
                  return Number.isFinite(v) ? [`${v.toFixed(4)} ms`, 'Latency'] : ['—', 'Latency'];
                }}
              />
              <Bar dataKey="latency" fill="#10b981" name="Search Latency" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}