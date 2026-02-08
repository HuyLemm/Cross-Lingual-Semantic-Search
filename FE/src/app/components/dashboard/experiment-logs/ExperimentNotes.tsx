import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function ExperimentNotes() {
  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-slate-100">Experiment Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
        <div className="flex items-start space-x-2">
          <span className="text-slate-500 dark:text-slate-400">ℹ</span>
          <p>All experiments use the same evaluation protocol with consistent train/test splits for fair comparison.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-green-600 dark:text-green-400">✓</span>
          <p><strong>EXP-001</strong> achieved the best overall performance with BGE-M3 and HNSW indexing.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-red-600 dark:text-red-400">✗</span>
          <p><strong>EXP-005</strong> failed due to memory issues with PQ compression on the full dataset.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-amber-600 dark:text-amber-400">⚠</span>
          <p>Latency measurements include embedding generation, retrieval, and optional reranking time.</p>
        </div>
      </CardContent>
    </Card>
  );
}
