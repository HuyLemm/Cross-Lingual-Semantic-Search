import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type StoragePoint = {
  database: string;
  storage: number | null | undefined; // MB
};

interface StorageCostChartProps {
  data: StoragePoint[];
}

function isFiniteNumber(v: any): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export default function StorageCostChart({ data }: StorageCostChartProps) {
  const clean = (data || [])
    .map((d) => ({
      database: String(d.database ?? '').trim(),
      storage: d.storage == null ? null : Number(d.storage),
    }))
    .filter((d) => d.database && isFiniteNumber(d.storage));

  // sort small -> large
  clean.sort((a, b) => (a.storage as number) - (b.storage as number));

  const has = clean.length > 0;

  const maxV = has ? Math.max(...clean.map((d) => d.storage as number)) : 1;
  const paddedMax = Math.max(1, maxV * 1.15);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Cost (MB)</CardTitle>
      </CardHeader>

      <CardContent className="min-h-[320px]">
        {!has ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            No storage data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                type="number"
                dataKey="storage"
                domain={[0, paddedMax]}
                tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(0) : '')}
                label={{ value: 'Storage (MB)', position: 'insideBottom', offset: -5 }}
              />

              <YAxis
                type="category"
                dataKey="database"
                width={120}
              />

              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name, props) => {
                  const v = typeof value === 'number' ? value : Number(value);
                  return Number.isFinite(v) ? [`${v.toFixed(2)} MB`, 'Storage'] : ['—', 'Storage'];
                }}
                labelFormatter={(label) => String(label)}
              />

              <Scatter
                name="Storage"
                data={clean}
                fill="#f59e0b"
                // size controls dot size (optional)
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}