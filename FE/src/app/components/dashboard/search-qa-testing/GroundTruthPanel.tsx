import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface GroundTruth {
  question: string;
  expectedAnswer: string;
  sourceChunk: string;
}

interface GroundTruthPanelProps {
  groundTruth: GroundTruth;
}

export default function GroundTruthPanel({ groundTruth }: GroundTruthPanelProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Expected Result (Ground Truth)</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Question</p>
          <p className="text-sm text-gray-900 dark:text-white">{groundTruth.question}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Expected Answer</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-3 rounded">
            {groundTruth.expectedAnswer}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Source Chunk ID</p>
          <Badge variant="outline">{groundTruth.sourceChunk}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
