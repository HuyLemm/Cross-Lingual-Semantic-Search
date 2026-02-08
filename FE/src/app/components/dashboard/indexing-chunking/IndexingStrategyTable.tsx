import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { IndexingStrategy } from './indexingChunkingData';

interface IndexingStrategyTableProps {
  strategies: IndexingStrategy[];
}

export default function IndexingStrategyTable({ strategies }: IndexingStrategyTableProps) {
  const getBestFor = (name: string) => {
    if (name === 'Flat') return 'Perfect recall';
    if (name === 'IVF (nlist=100)') return 'Balanced';
    if (name === 'HNSW (M=32)') return 'Low latency';
    if (name === 'PQ (m=8)') return 'Low memory';
    if (name === 'IVF+PQ') return 'Production';
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indexing Strategy Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">Build Time (s)</TableHead>
              <TableHead className="text-right">Query Latency (ms)</TableHead>
              <TableHead className="text-right">Recall@10</TableHead>
              <TableHead className="text-right">Memory (GB)</TableHead>
              <TableHead>Best For</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((strategy) => (
              <TableRow key={strategy.name}>
                <TableCell className="font-medium">{strategy.name}</TableCell>
                <TableCell className="text-right">{strategy.buildTime}s</TableCell>
                <TableCell className="text-right">
                  <span className={strategy.queryLatency < 10 ? 'text-green-600 dark:text-green-400' : ''}>
                    {strategy.queryLatency}ms
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={strategy.recall >= 0.98 ? 'text-green-600 dark:text-green-400' : ''}>
                    {(strategy.recall * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">{strategy.memory} GB</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {getBestFor(strategy.name)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
