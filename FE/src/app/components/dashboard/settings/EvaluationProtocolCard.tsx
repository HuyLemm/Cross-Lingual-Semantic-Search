import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Slider } from '@/app/components/ui/slider';

interface EvaluationProtocolCardProps {
  topKThreshold: number[];
  confidenceThreshold: number[];
  onTopKChange: (value: number[]) => void;
  onConfidenceChange: (value: number[]) => void;
}

export default function EvaluationProtocolCard({
  topKThreshold,
  confidenceThreshold,
  onTopKChange,
  onConfidenceChange,
}: EvaluationProtocolCardProps) {
  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-slate-100">Evaluation Protocol</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="eval-mode" className="text-gray-700 dark:text-slate-300">Evaluation Mode</Label>
          <Select defaultValue="semantic">
            <SelectTrigger id="eval-mode" className="mt-2 border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exact">Exact Match</SelectItem>
              <SelectItem value="semantic">Semantic Match</SelectItem>
              <SelectItem value="hybrid">Hybrid (Exact + Semantic)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-gray-700 dark:text-slate-300">Top-K Default Value: {topKThreshold[0]}</Label>
          </div>
          <Slider
            value={topKThreshold}
            onValueChange={onTopKChange}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Default number of results to retrieve for evaluation
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-gray-700 dark:text-slate-300">Similarity Threshold: {confidenceThreshold[0].toFixed(2)}</Label>
          </div>
          <Slider
            value={confidenceThreshold}
            onValueChange={onConfidenceChange}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Similarity threshold for valid ground truth matching
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-gray-700 dark:text-slate-300">Restrict Retrieval to Query Language</Label>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Restrict retrieval to documents in the same language as the query
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-gray-700 dark:text-slate-300">Include Reranking in Metrics</Label>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Apply reranker before calculating metrics
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
