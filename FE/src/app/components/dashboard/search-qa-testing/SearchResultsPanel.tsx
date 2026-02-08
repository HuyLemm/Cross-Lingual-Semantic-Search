import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Eye } from 'lucide-react';

interface SearchResult {
  id: number;
  chunkId: string;
  score: number;
  text: string;
  source: string;
  language: string;
  position: number;
}

interface SearchResultsPanelProps {
  results: SearchResult[];
  groundTruthChunkId: string;
}

export default function SearchResultsPanel({ results, groundTruthChunkId }: SearchResultsPanelProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Retrieved Results ({results.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {results.map((result, idx) => (
            <div
              key={result.id}
              className={`p-4 border rounded-lg ${
                result.chunkId === groundTruthChunkId
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">#{idx + 1}</Badge>
                  <Badge variant="outline" className="text-xs">Score: {result.score.toFixed(3)}</Badge>
                  {result.chunkId === groundTruthChunkId && <Badge className="bg-green-500 text-white">✓ Match</Badge>}
                </div>
                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{result.text}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <span>📄 {result.source}</span>
                <span>•</span>
                <span>🌐 {result.language.toUpperCase()}</span>
                <span>•</span>
                <span>ID: {result.chunkId}</span>
                <span>•</span>
                <span>Pos: {result.position}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
