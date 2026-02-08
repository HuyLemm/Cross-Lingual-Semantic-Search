import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function ErrorInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-start space-x-2">
          <span className="text-red-500">🔴</span>
          <p><strong>Wrong Language Match (12.3%):</strong> Most critical issue. Models struggle with language-specific queries, especially mUSE with limited language support.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-orange-500">🟠</span>
          <p><strong>Partial Context (32.2%):</strong> Largest error category. Consider larger chunk sizes or overlapping chunks for better context preservation.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-yellow-500">🟡</span>
          <p><strong>Keyword Bias (24.5%):</strong> Models sometimes prioritize lexical matches over semantic relevance. Reranking can help but adds latency.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-blue-500">ℹ</span>
          <p><strong>Recommendation:</strong> Implement language detection preprocessing and use BGE-M3 for best multilingual performance.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-green-500">✓</span>
          <p><strong>Success Rate:</strong> Overall 81.1% success rate indicates strong baseline performance with room for targeted improvements.</p>
        </div>
      </CardContent>
    </Card>
  );
}
