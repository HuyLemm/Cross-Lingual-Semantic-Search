import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Database } from './vectorDatabaseData';

interface DatabaseComparisonTableProps {
  databases: Database[];
}

export default function DatabaseComparisonTable({ databases }: DatabaseComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Database</TableHead>
              <TableHead className="text-right">Insert Speed (vecs/s)</TableHead>
              <TableHead className="text-right">Search Latency (ms)</TableHead>
              <TableHead className="text-right">Recall@10</TableHead>
              <TableHead className="text-right">Storage (GB)</TableHead>
              <TableHead>Key Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {databases.map((db) => (
              <TableRow key={db.name}>
                <TableCell className="font-medium">{db.name}</TableCell>
                <TableCell className="text-right">
                  <span className={db.insertSpeed > 12000 ? 'text-green-600 dark:text-green-400' : ''}>
                    {db.insertSpeed.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={db.searchLatency < 10 ? 'text-green-600 dark:text-green-400' : ''}>
                    {db.searchLatency}ms
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={db.recallK >= 0.97 ? 'text-green-600 dark:text-green-400' : ''}>
                    {(db.recallK * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">{db.storageCost} GB</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {db.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
