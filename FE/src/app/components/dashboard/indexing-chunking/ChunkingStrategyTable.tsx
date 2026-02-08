import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { ChunkingStrategy } from './indexingChunkingData';

interface ChunkingStrategyTableProps {
  strategies: ChunkingStrategy[];
}

export default function ChunkingStrategyTable({ strategies }: ChunkingStrategyTableProps) {
  const getNotes = (name: string) => {
    if (name === 'Fixed 512') return 'Fast, simple';
    if (name === 'Fixed 1024') return 'More context';
    if (name === 'Sliding 512/128') return 'Better coverage';
    if (name === 'Semantic') return 'Best quality';
    if (name === 'Paragraph') return 'Natural boundaries';
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chunking Strategy Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">Avg Chunks</TableHead>
              <TableHead className="text-right">Recall@10</TableHead>
              <TableHead className="text-right">Overlap Ratio</TableHead>
              <TableHead className="text-right">Coherence Score</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((strategy) => (
              <TableRow key={strategy.name}>
                <TableCell className="font-medium">{strategy.name}</TableCell>
                <TableCell className="text-right">{strategy.avgChunks.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className={strategy.recall >= 0.90 ? 'text-green-600 dark:text-green-400' : ''}>
                    {(strategy.recall * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">{(strategy.overlap * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right">
                  <span className={strategy.coherence >= 0.90 ? 'text-green-600 dark:text-green-400' : ''}>
                    {strategy.coherence.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {getNotes(strategy.name)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
