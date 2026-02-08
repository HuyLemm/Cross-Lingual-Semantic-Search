import { Card, CardContent } from '@/app/components/ui/card';

export default function ModelRecommendations() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Overall</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">BGE-M3</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Highest recall and MRR with strong multilingual support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fastest</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">mUSE</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Best for low-latency applications with acceptable accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Most Multilingual</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">LaBSE</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Supports 109 languages with strong cross-lingual performance
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <p><strong>BGE-M3</strong> offers the best balance of accuracy and multilingual coverage, making it ideal for diverse corpora.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500">•</span>
            <p><strong>Cross-Encoder reranking</strong> significantly improves recall but adds considerable latency (~80ms overhead).</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500">•</span>
            <p><strong>ColBERT</strong> provides strong performance but requires 3x more memory due to token-level embeddings.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <p><strong>mUSE</strong> is recommended for real-time applications where sub-30ms latency is critical.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
