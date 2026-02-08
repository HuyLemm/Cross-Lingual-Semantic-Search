import { Card, CardContent } from '@/app/components/ui/card';
import { Experiment } from './experimentLogsData';
import { useMemo } from 'react';

interface ExperimentLogsSummaryProps {
  experiments: Experiment[];
}

export default function ExperimentLogsSummary({ experiments }: ExperimentLogsSummaryProps) {
  const stats = useMemo(() => {
    const total = experiments.length;
    const completed = experiments.filter(exp => exp.status === 'Completed').length;
    const failed = experiments.filter(exp => exp.status === 'Failed').length;
    const bestMRR = Math.max(...experiments.map(exp => exp.mrr));
    
    return { total, completed, failed, bestMRR };
  }, [experiments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-slate-400">Total Experiments</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-1">{stats.total}</p>
        </CardContent>
      </Card>
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-slate-400">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
        </CardContent>
      </Card>
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-slate-400">Failed</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.failed}</p>
        </CardContent>
      </Card>
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-slate-400">Best MRR</p>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-300 mt-1">{stats.bestMRR.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
