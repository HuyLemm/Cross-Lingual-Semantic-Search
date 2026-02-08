import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function DatabaseRecommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-start space-x-2">
          <span className="text-blue-500">•</span>
          <p><strong>FAISS:</strong> Best for single-machine deployments with highest performance requirements. Limited scalability.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-green-500">•</span>
          <p><strong>Milvus:</strong> Recommended for production systems requiring distributed architecture and high recall.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-purple-500">•</span>
          <p><strong>Qdrant:</strong> Great balance of performance and features. Rust-based for safety and speed.</p>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-orange-500">•</span>
          <p><strong>Weaviate:</strong> Best for complex queries with hybrid search and rich metadata filtering needs.</p>
        </div>
      </CardContent>
    </Card>
  );
}
