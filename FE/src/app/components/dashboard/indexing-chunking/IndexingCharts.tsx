import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IndexingChartsProps {
  buildTimeData: Array<{ strategy: string; time: number | null | undefined }>;
  queryLatencyData: Array<{ strategy: string; latency: number | null | undefined }>;
}

function isNonEmptyArray(a: any[]) {
  return Array.isArray(a) && a.length > 0;
}

export default function IndexingCharts({ buildTimeData, queryLatencyData }: IndexingChartsProps) {
  // sanitize + remove invalid rows
  const buildClean = (buildTimeData || [])
    .map((d) => ({ strategy: String(d.strategy ?? ''), time: Number(d.time) }))
    .filter((d) => d.strategy && Number.isFinite(d.time));

  const latencyClean = (queryLatencyData || [])
    .map((d) => ({ strategy: String(d.strategy ?? ''), latency: Number(d.latency) }))
    .filter((d) => d.strategy && Number.isFinite(d.latency));

  const hasBuild = isNonEmptyArray(buildClean);
  const hasLatency = isNonEmptyArray(latencyClean);

  const maxBuild = buildClean.reduce((m, d) => Math.max(m, d.time), 0);
  const maxLatency = latencyClean.reduce((m, d) => Math.max(m, d.latency), 0);

  // add padding so bars don’t look cramped; avoid 0 max
  const buildYMax = maxBuild > 0 ? maxBuild * 1.1 : 1;
  const latencyXMax = maxLatency > 0 ? maxLatency * 1.1 : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Index Build Time */}
      <Card>
        <CardHeader>
          <CardTitle>Index Build Time</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasBuild ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              No build-time data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildClean} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" />
                <YAxis
                  domain={[0, buildYMax]}
                  label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(v) => (typeof v === 'number' ? `${v.toFixed(0)}s` : '')}
                />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.strategy ? `Strategy: ${payload[0].payload.strategy}` : ''
                  }
                  formatter={(value) => {
                    const v = typeof value === 'number' ? value : Number(value);
                    return Number.isFinite(v) ? [`${v.toFixed(1)} s`, 'Build Time'] : ['—', 'Build Time'];
                  }}
                />
                <Bar dataKey="time" fill="#3b82f6" name="Build Time" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Query Latency */}
      <Card>
        <CardHeader>
          <CardTitle>Query Latency Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasLatency ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              No latency data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={latencyClean} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, latencyXMax]}
                  label={{ value: 'Latency (ms)', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(v) => (typeof v === 'number' ? `${v.toFixed(2)}ms` : '')}
                />
                <YAxis dataKey="strategy" type="category" width={120} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.strategy ? `Strategy: ${payload[0].payload.strategy}` : ''
                  }
                  formatter={(value) => {
                    const v = typeof value === 'number' ? value : Number(value);
                    return Number.isFinite(v) ? [`${v.toFixed(4)} ms`, 'Latency'] : ['—', 'Latency'];
                  }}
                />
                <Bar dataKey="latency" fill="#10b981" name="Query Latency" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}