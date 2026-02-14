import { useState } from 'react';
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

export interface DatasetMetrics {
  language: string;
  model: string;
  verification: string;     // bi / cross / both
  qaCount: number;
  avgSimilarity: number;
  avgEntailment: number;
  verifiedRatio: number;
}

interface DatasetStatisticsTableProps {
  data: DatasetMetrics[];
}

export default function DatasetStatisticsTable({ data }: DatasetStatisticsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof DatasetMetrics>('verifiedRatio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof DatasetMetrics) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction;
    }
    return String(aVal).localeCompare(String(bVal)) * direction;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>QA Dataset Statistics</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Distribution and reliability metrics of verified QA dataset (sortable)
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>

                {/* Language */}
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('language')}
                >
                  Language {sortColumn === 'language' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

                {/* Model */}
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('model')}
                >
                  Model {sortColumn === 'model' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

                {/* Verification */}
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('verification')}
                >
                  Verified By {sortColumn === 'verification' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

                {/* QA Count */}
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort('qaCount')}
                >
                  QA Count {sortColumn === 'qaCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

                {/* Similarity */}
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort('avgSimilarity')}
                >
                  Avg Similarity {sortColumn === 'avgSimilarity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

                {/* Entailment */}
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort('avgEntailment')}
                >
                  Avg Entailment {sortColumn === 'avgEntailment' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

                {/* Verified Ratio */}
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort('verifiedRatio')}
                >
                  Verified % {sortColumn === 'verifiedRatio' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedData.map((row, idx) => (
                <TableRow key={idx}>

                  {/* Language */}
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {row.language}
                    </Badge>
                  </TableCell>

                  {/* Model */}
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {row.model}
                    </Badge>
                  </TableCell>

                  {/* Verification */}
                  <TableCell>
                    <Badge
                      variant={
                        row.verification === 'both'
                          ? 'default'
                          : row.verification === 'bi'
                          ? 'outline'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {row.verification}
                    </Badge>
                  </TableCell>

                  {/* QA Count */}
                  <TableCell className="text-right">
                    {row.qaCount.toLocaleString()}
                  </TableCell>

                  {/* Similarity */}
                  <TableCell className="text-right">
                    <span
                      className={
                        row.avgSimilarity >= 0.86
                          ? 'text-green-600 font-medium'
                          : row.avgSimilarity >= 0.82
                          ? 'text-yellow-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {row.avgSimilarity.toFixed(3)}
                    </span>
                  </TableCell>

                  {/* Entailment */}
                  <TableCell className="text-right">
                    <span
                      className={
                        row.avgEntailment >= 0.85
                          ? 'text-green-600 font-medium'
                          : row.avgEntailment >= 0.80
                          ? 'text-yellow-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {row.avgEntailment.toFixed(3)}
                    </span>
                  </TableCell>

                  {/* Verified Ratio */}
                  <TableCell className="text-right">
                    <span
                      className={
                        row.verifiedRatio >= 0.80
                          ? 'text-green-600 font-medium'
                          : row.verifiedRatio >= 0.75
                          ? 'text-yellow-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {(row.verifiedRatio * 100).toFixed(1)}%
                    </span>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
