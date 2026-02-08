import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function RerankingInsights() {
  return (
    <Card>
      <CardHeader><CardTitle>Key Findings</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-start space-x-2">
          <span className="text-green-500">✓</span>
          <p>Reranking improves Recall@5 by 9% and MRR by 0.11, significantly boosting overall performance.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-green-500">✓</span>
          <p>Greatest improvements occur at ranks 3-5, where initial embeddings struggle with subtle semantic differences.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-orange-500">⚠</span>
          <p>Reranking adds 78ms latency (156% increase), making it unsuitable for real-time applications.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-red-500">✗</span>
          <p>2.3% of queries experience degraded performance, often due to keyword bias in the reranker.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-blue-500">ℹ</span>
          <p>Consider hybrid approach: use reranking only for queries with low initial confidence scores.</p>
        </div>
      </CardContent>
    </Card>
  );
}
