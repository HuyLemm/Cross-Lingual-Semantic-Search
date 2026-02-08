import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

interface LanguageChartData {
  language: string;
  recall: number;
  precision: number;
  f1: number;
  avgSimilarity: number;
}

interface LanguageMetricsChartProps {
  data: LanguageChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toFixed(3)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LanguageMetricsChart({ data }: LanguageMetricsChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Retrieval & Similarity Metrics by Language</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Performance comparison across supported languages
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1 max-w-xs">
                <p><strong>Recall:</strong> % of relevant results retrieved</p>
                <p><strong>Precision:</strong> % of retrieved results that are relevant</p>
                <p><strong>F1-Score:</strong> Harmonic mean of precision and recall</p>
                <p><strong>Avg Similarity:</strong> Mean cosine similarity between Q&A and context</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
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
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar dataKey="recall" fill="#3b82f6" name="Recall" radius={[4, 4, 0, 0]} />
            <Bar dataKey="precision" fill="#10b981" name="Precision" radius={[4, 4, 0, 0]} />
            <Bar dataKey="f1" fill="#8b5cf6" name="F1-Score" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgSimilarity" fill="#f59e0b" name="Avg Similarity" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
