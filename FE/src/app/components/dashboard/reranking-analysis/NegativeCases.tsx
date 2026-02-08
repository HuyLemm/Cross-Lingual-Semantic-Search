import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface ErrorCase {
  queryId: string;
  query: string;
  severity: string;
  issue: string;
  impact: string;
}

interface NegativeCasesProps {
  errorCases: ErrorCase[];
}

export default function NegativeCases({ errorCases }: NegativeCasesProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Cases Where Reranking Hurts Performance</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errorCases.map((error) => (
            <div key={error.queryId} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono">{error.queryId}</Badge>
                  <Badge variant="destructive">{error.severity} Severity</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-900 dark:text-white mb-2"><strong>Query:</strong> {error.query}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Issue:</strong> {error.issue}</p>
              <p className="text-sm text-red-600 dark:text-red-400"><strong>Impact:</strong> {error.impact}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
