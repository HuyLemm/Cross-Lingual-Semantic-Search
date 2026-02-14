import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Info } from 'lucide-react';

interface DatasetChartData {
  language: string;
  avgSimilarity: number;
  avgEntailment: number;
  verifiedRatio: number;
}

interface DatasetMetricsChartProps {
  data: DatasetChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{' '}
            <span className="font-semibold">
              {typeof entry.value === 'number'
                ? entry.value.toFixed(3)
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DatasetMetricsChart({ data }: DatasetMetricsChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>QA Dataset Quality by Language</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Semantic similarity, entailment correctness, and verification reliability
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1 max-w-xs">
                <p>
                  <strong>Avg Similarity:</strong> Bi-encoder semantic similarity
                </p>
                <p>
                  <strong>Avg Entailment:</strong> Cross-encoder correctness score
                </p>
                <p>
                  <strong>Verified Ratio:</strong> % QA passing both encoders
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-slate-700"
            />

            <XAxis
              dataKey="language"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />

            <YAxis
              domain={[0, 1]}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />

            <RechartsTooltip content={<CustomTooltip />} />

            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />

            <Bar
              dataKey="avgSimilarity"
              fill="#3b82f6"
              name="Avg Similarity"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="avgEntailment"
              fill="#10b981"
              name="Avg Entailment"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="verifiedRatio"
              fill="#8b5cf6"
              name="Verified Ratio"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
