import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type RecallPoint = {
  database: string;          // strategy name, e.g. "HNSW (M=32)"
  recall: number | null | undefined; // 0..1
};

interface RecallComparisonChartProps {
  data: RecallPoint[];
}

function isNonEmptyArray(a: any[]) {
  return Array.isArray(a) && a.length > 0;
}

export default function RecallComparisonChart({ data }: RecallComparisonChartProps) {
  const clean = (data || [])
    .map((d) => ({
      database: String(d.database ?? ''),
      recall: d.recall == null ? null : Number(d.recall),
    }))
    .filter((d) => d.database);

  const has = isNonEmptyArray(clean);

  const maxRecall =
    has ? Math.max(...clean.map((d) => (typeof d.recall === 'number' && Number.isFinite(d.recall) ? d.recall : -Infinity))) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recall@10 Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {!has ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            No recall data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clean}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="database" />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(v) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : '')}
                label={{ value: 'Recall@10', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                labelFormatter={(label) => `Strategy: ${label}`}
                formatter={(value) => {
                  const v = typeof value === 'number' ? value : Number(value);
                  return Number.isFinite(v) ? [`${(v * 100).toFixed(1)}%`, 'Recall@10'] : ['—', 'Recall@10'];
                }}
              />
              <Bar
                dataKey="recall"
                name="Recall@10"
                fill="#3b82f6"
                isAnimationActive={false}
                // optional: if you want different color for best bar, you can add <Cell/>,
                // but keep it simple like your other charts.
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {has && maxRecall != null && Number.isFinite(maxRecall) && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Best Recall@10: {(maxRecall * 100).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}