import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export default function StrategyRecommendations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">For Speed</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">HNSW + Fixed 512</p>
              <Badge variant="outline" className="mt-2">3.5ms latency</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">For Accuracy</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Flat + Semantic</p>
              <Badge variant="outline" className="mt-2">93% recall</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Balanced</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">IVF + Sliding Window</p>
              <Badge variant="outline" className="mt-2">8.2ms / 91% recall</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
