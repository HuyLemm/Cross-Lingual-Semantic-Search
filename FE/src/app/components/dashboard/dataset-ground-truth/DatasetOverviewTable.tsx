import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { Dataset } from './datasetGroundTruthData';

interface DatasetOverviewTableProps {
  datasets: Dataset[];
}

export default function DatasetOverviewTable({
  datasets = [],
}: DatasetOverviewTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Overview</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dataset</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Experiment</TableHead>
              <TableHead className="text-right">QA Pairs</TableHead>
              <TableHead className="text-right">Avg Bi-Encoder</TableHead>
              <TableHead className="text-right">Avg Cross-Encoder</TableHead>
              <TableHead className="text-center">Validation</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {datasets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No dataset available
                </TableCell>
              </TableRow>
            ) : (
              datasets.map((d) => {
                const verified = d.avgCrossEncoder >= 0.9;

                return (
                  <TableRow key={d.id}>
                    {/* Dataset */}
                    <TableCell className="font-medium">{d.name}</TableCell>

                    {/* Language */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {d.language}
                      </Badge>
                    </TableCell>

                    {/* Source */}
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {d.source}
                    </TableCell>

                    {/* Model */}
                    <TableCell className="font-mono text-xs">
                      {d.model}
                    </TableCell>

                    {/* Experiment */}
                    <TableCell className="font-mono">
                      {d.experiment}
                    </TableCell>

                    {/* QA */}
                    <TableCell className="text-right">
                      {d.qaPairs.toLocaleString()}
                    </TableCell>

                    {/* Avg Bi */}
                    <TableCell className="text-right">
                      <span
                        className={
                          d.avgBiEncoder >= 0.85
                            ? 'text-green-600 font-medium'
                            : 'text-orange-500 font-medium'
                        }
                      >
                        {Number(d.avgBiEncoder ?? 0).toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Avg CE */}
                    <TableCell className="text-right">
                      <span
                        className={
                          d.avgCrossEncoder >= 0.9
                            ? 'text-green-600 font-medium'
                            : 'text-orange-500 font-medium'
                        }
                      >
                        {Number(d.avgCrossEncoder ?? 0).toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Validation */}
                    <TableCell className="text-center">
                      {verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
