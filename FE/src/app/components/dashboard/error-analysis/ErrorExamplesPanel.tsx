import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, Eye } from 'lucide-react';
import { ErrorExample } from './errorAnalysisData';

interface ErrorExamplesPanelProps {
  examples: ErrorExample[];
}

export default function ErrorExamplesPanel({ examples }: ErrorExamplesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Examples with Highlighted Text</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {examples.map((example) => (
            <div key={example.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <Badge variant="outline" className="font-mono">{example.id}</Badge>
                  <Badge variant="destructive">{example.category}</Badge>
                  <Badge variant="secondary">{example.model}</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Query ({example.queryLang}):</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{example.query}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Retrieved ({example.retrievedLang}):</span>
                  <p className="text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/10 p-2 rounded mt-1">
                    {example.retrieved}
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
                  <span className="font-semibold text-blue-900 dark:text-blue-300">Analysis:</span>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">{example.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
