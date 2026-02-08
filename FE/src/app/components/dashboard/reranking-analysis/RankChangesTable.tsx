import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface RankChange {
  queryId: string;
  beforeRank: number;
  afterRank: number;
  change: 'up' | 'down' | 'same';
  scoreBefore: number;
  scoreAfter: number;
}

interface RankChangesTableProps {
  rankChanges: RankChange[];
}

export default function RankChangesTable({ rankChanges }: RankChangesTableProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Rank Changes After Reranking</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query ID</TableHead>
              <TableHead className="text-center">Before Rank</TableHead>
              <TableHead className="text-center">After Rank</TableHead>
              <TableHead className="text-center">Change</TableHead>
              <TableHead className="text-right">Score Before</TableHead>
              <TableHead className="text-right">Score After</TableHead>
              <TableHead className="text-right">Score Δ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankChanges.map((item) => (
              <TableRow key={item.queryId}>
                <TableCell className="font-mono text-sm">{item.queryId}</TableCell>
                <TableCell className="text-center"><Badge variant="outline">#{item.beforeRank}</Badge></TableCell>
                <TableCell className="text-center"><Badge variant={item.afterRank === 1 ? 'default' : 'secondary'}>#{item.afterRank}</Badge></TableCell>
                <TableCell className="text-center">
                  {item.change === 'up' && <ArrowUp className="w-5 h-5 text-green-500 mx-auto" />}
                  {item.change === 'down' && <ArrowDown className="w-5 h-5 text-red-500 mx-auto" />}
                  {item.change === 'same' && <Minus className="w-5 h-5 text-gray-400 mx-auto" />}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{item.scoreBefore.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono text-sm">{item.scoreAfter.toFixed(3)}</TableCell>
                <TableCell className="text-right">
                  <span className={item.scoreAfter > item.scoreBefore ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {item.scoreAfter > item.scoreBefore ? '+' : ''}{(item.scoreAfter - item.scoreBefore).toFixed(3)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
