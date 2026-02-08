import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Model } from './modelComparisonData';

interface ModelComparisonTableProps {
  models: Model[];
}

export default function ModelComparisonTable({ models }: ModelComparisonTableProps) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Model Comparison</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Compare embedding and reranking models across key metrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Multilingual</TableHead>
                <TableHead className="text-right">Recall@10</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Latency (ms)</TableHead>
                <TableHead className="text-right">Memory (GB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.name}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>
                    <Badge variant={model.type === 'Embedding' ? 'default' : model.type === 'Reranker' ? 'secondary' : 'outline'}>
                      {model.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{model.multilingual}</TableCell>
                  <TableCell className="text-right">
                    <span className={model.recallK >= 0.90 ? 'text-green-600 dark:text-green-400' : ''}>
                      {(model.recallK * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{model.mrr.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{model.latency}ms</TableCell>
                  <TableCell className="text-right">{model.memory.toFixed(1)} GB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
