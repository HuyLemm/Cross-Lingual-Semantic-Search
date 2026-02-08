import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface EmbeddingDetail {
  model: string;
  dimension: number;
}

interface EmbeddingQualityMetricsProps {
  embeddingDetails: EmbeddingDetail[];
}

export default function EmbeddingQualityMetrics({ embeddingDetails }: EmbeddingQualityMetricsProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Embedding Quality Metrics</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Dimensionality</h4>
            <div className="space-y-2 text-sm">
              {embeddingDetails.map(m => (
                <div key={m.model} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{m.model}:</span>
                  <span className="font-mono">{m.dimension}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Separation Score</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Same Topic:</span>
                <span className="text-green-600 dark:text-green-400">0.82</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Diff Topic:</span>
                <span className="text-blue-600 dark:text-blue-400">0.31</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Separation:</span>
                <span className="text-purple-600 dark:text-purple-400">0.51</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Drift Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Temporal Drift:</span>
                <span className="text-green-600 dark:text-green-400">Low (0.03)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Domain Drift:</span>
                <span className="text-yellow-600 dark:text-yellow-400">Medium (0.12)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Stability:</span>
                <span className="text-green-600 dark:text-green-400">High (0.95)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
