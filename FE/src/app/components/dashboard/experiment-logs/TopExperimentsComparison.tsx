import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Experiment } from './experimentLogsData';

interface TopExperimentsComparisonProps {
  experiments: Experiment[];
}

export default function TopExperimentsComparison({ experiments }: TopExperimentsComparisonProps) {
  const top3 = experiments.slice(0, 3);

  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-slate-100">Quick Comparison: Top 3 Experiments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((exp, idx) => (
            <div key={exp.runId} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 dark:bg-slate-800">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={idx === 0 ? 'default' : 'outline'} className={idx === 0 ? 'bg-slate-700 dark:bg-slate-600' : 'border-gray-300 dark:border-slate-600 dark:text-slate-300'}>
                  {idx === 0 ? '🏆 Best' : `#${idx + 1}`}
                </Badge>
                <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">{exp.model}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Run ID:</span>
                  <span className="font-mono text-xs text-gray-900 dark:text-slate-200">{exp.runId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Recall@10:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{(exp.recallK10 * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">MRR:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{exp.mrr.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Latency:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{exp.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Index:</span>
                  <span className="text-gray-900 dark:text-slate-200">{exp.indexStrategy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
