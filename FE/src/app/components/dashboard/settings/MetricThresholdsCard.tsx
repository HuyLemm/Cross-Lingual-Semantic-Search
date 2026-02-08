import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export default function MetricThresholdsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metric Thresholds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recall-threshold">Recall@10 Threshold</Label>
            <Input 
              id="recall-threshold" 
              type="number" 
              step="0.01" 
              defaultValue="0.85" 
              className="mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum acceptable recall rate
            </p>
          </div>

          <div>
            <Label htmlFor="mrr-threshold">MRR Threshold</Label>
            <Input 
              id="mrr-threshold" 
              type="number" 
              step="0.01" 
              defaultValue="0.70" 
              className="mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum acceptable MRR score
            </p>
          </div>

          <div>
            <Label htmlFor="latency-threshold">Max Latency (ms)</Label>
            <Input 
              id="latency-threshold" 
              type="number" 
              defaultValue="100" 
              className="mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum acceptable query latency
            </p>
          </div>

          <div>
            <Label htmlFor="error-threshold">Max Error Rate (%)</Label>
            <Input 
              id="error-threshold" 
              type="number" 
              defaultValue="15" 
              className="mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum acceptable error rate
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
