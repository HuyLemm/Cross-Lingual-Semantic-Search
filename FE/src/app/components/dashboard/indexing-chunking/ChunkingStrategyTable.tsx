import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

export interface ChunkingStrategy {
  name: string;
  avgChunks: number;
  recall: number | null;
  overlap: number;      // 0..1
  coherence: number | null;
  notes?: string;       // API có thể trả sẵn
}

interface ChunkingStrategyTableProps {
  strategies: ChunkingStrategy[];
}

export default function ChunkingStrategyTable({ strategies }: ChunkingStrategyTableProps) {
  const getNotesFallback = (name: string) => {
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
            {strategies.map((s) => {
              const recallText = typeof s.recall === 'number' ? `${(s.recall * 100).toFixed(1)}%` : '—';
              const overlapText = typeof s.overlap === 'number' ? `${(s.overlap * 100).toFixed(0)}%` : '—';
              const coherenceText = typeof s.coherence === 'number' ? s.coherence.toFixed(2) : '—';

              const notes = (s.notes || '').trim() || getNotesFallback(s.name);

              return (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>

                  <TableCell className="text-right">
                    {typeof s.avgChunks === 'number' ? s.avgChunks.toLocaleString() : '—'}
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        typeof s.recall === 'number' && s.recall >= 0.9 ? 'text-green-600 dark:text-green-400' : ''
                      }
                    >
                      {recallText}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">{overlapText}</TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        typeof s.coherence === 'number' && s.coherence >= 0.9
                          ? 'text-green-600 dark:text-green-400'
                          : ''
                      }
                    >
                      {coherenceText}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{notes}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}