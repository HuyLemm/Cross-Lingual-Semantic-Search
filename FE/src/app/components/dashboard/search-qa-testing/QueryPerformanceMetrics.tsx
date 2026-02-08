import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function QueryPerformanceMetrics() {
  return (
    <Card>
      <CardHeader><CardTitle>Query Performance</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Latency</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">42ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recall@5</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">0.82</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">MRR</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">0.68</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ground Truth Rank</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">#1</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
