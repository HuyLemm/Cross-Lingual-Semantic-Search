import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function EmbeddingInsights() {
  return (
    <Card>
      <CardHeader><CardTitle>Key Insights</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-start space-x-2">
          <span className="text-blue-500">•</span>
          <p>Higher dimensional embeddings (1024) show better semantic separation but require more storage and compute.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-green-500">•</span>
          <p>Cross-lingual similarity is 15-20% lower than intra-lingual, indicating room for improvement in multilingual alignment.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-purple-500">•</span>
          <p>BGE-M3 maintains the best balance between intra-language and cross-language performance.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-orange-500">•</span>
          <p>Embedding drift is minimal (0.03), indicating stable performance across different time periods.</p>
        </div>
      </CardContent>
    </Card>
  );
}
