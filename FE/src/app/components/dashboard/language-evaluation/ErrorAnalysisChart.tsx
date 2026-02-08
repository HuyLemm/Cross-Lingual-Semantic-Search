import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

interface ErrorAnalysisData {
  language: string;
  falsePositive: number;
  falseNegative: number;
}

interface ErrorAnalysisChartProps {
  data: ErrorAnalysisData[];
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

export default function ErrorAnalysisChart({ data }: ErrorAnalysisChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Error Analysis by Language</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              False positive and false negative rates across languages
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1 max-w-xs">
                <p><strong>False Positives:</strong> Irrelevant results incorrectly retrieved</p>
                <p><strong>False Negatives:</strong> Relevant results incorrectly missed</p>
                <p><strong>Common causes:</strong></p>
                <p>• Language ambiguity (polysemy, homonyms)</p>
                <p>• Translation drift in cross-lingual scenarios</p>
                <p>• Domain-specific terminology mismatch</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
            <XAxis 
              dataKey="language" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              domain={[0, 0.20]} 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="falsePositive" fill="#ef4444" name="False Positive Rate" radius={[4, 4, 0, 0]} />
            <Bar dataKey="falseNegative" fill="#f97316" name="False Negative Rate" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
