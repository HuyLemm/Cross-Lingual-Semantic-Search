import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';

interface CrossLingualData {
  pair: string;
  avgSimilarity: number;
  retrievalAccuracy: number;
}

interface CrossLingualChartsProps {
  data: CrossLingualData[];
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

export default function CrossLingualCharts({ data }: CrossLingualChartsProps) {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cross-Lingual Similarity</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avg similarity when query and document are in different languages
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis 
                  dataKey="pair" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 1]} 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="avgSimilarity" name="Avg Similarity" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgSimilarity >= 0.75 ? '#10b981' : entry.avgSimilarity >= 0.70 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Lingual Retrieval Accuracy</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Retrieval success rate across language pairs
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis 
                  dataKey="pair" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 1]} 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="retrievalAccuracy" name="Retrieval Accuracy" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.retrievalAccuracy >= 0.80 ? '#3b82f6' : entry.retrievalAccuracy >= 0.75 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Cross-Lingual Evaluation Note:</p>
            <p>Measures semantic consistency when questions and documents are in different languages. Lower scores indicate 
               challenges in cross-lingual semantic alignment, often due to language-specific nuances, idioms, or 
               domain-specific terminology that don't translate directly.</p>
          </div>
        </div>
      </div>
    </>
  );
}
