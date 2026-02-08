import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

export interface LanguageMetrics {
  language: string;
  recall: number;
  precision: number;
  f1: number;
  avgSimilarity: number;
  qaCount: number;
  successRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  avgLatency: number;
  model: string;
}

interface LanguageStatisticsTableProps {
  data: LanguageMetrics[];
}

export default function LanguageStatisticsTable({ data }: LanguageStatisticsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof LanguageMetrics>('successRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof LanguageMetrics) => {
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
        <CardTitle>Language Statistics</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive metrics across all evaluated languages (sortable by column)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                  onClick={() => handleSort('language')}
                >
                  <div className="flex items-center gap-1">
                    Language
                    {sortColumn === 'language' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-right"
                  onClick={() => handleSort('qaCount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    QA Count
                    {sortColumn === 'qaCount' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-right"
                  onClick={() => handleSort('avgSimilarity')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Avg Similarity
                    {sortColumn === 'avgSimilarity' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-right"
                  onClick={() => handleSort('successRate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Success Rate
                    {sortColumn === 'successRate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-right"
                  onClick={() => handleSort('falsePositiveRate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    FP Rate
                    {sortColumn === 'falsePositiveRate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-right"
                  onClick={() => handleSort('falseNegativeRate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    FN Rate
                    {sortColumn === 'falseNegativeRate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-right"
                  onClick={() => handleSort('avgLatency')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Avg Latency
                    {sortColumn === 'avgLatency' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center gap-1">
                    Model
                    {sortColumn === 'model' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((stat, index) => (
                <TableRow key={`${stat.language}-${stat.model}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">{stat.language}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{stat.qaCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={
                      stat.avgSimilarity >= 0.85 
                        ? 'text-green-600 dark:text-green-400 font-medium' 
                        : stat.avgSimilarity >= 0.80
                        ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                        : 'text-red-600 dark:text-red-400 font-medium'
                    }>
                      {stat.avgSimilarity.toFixed(3)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={
                      stat.successRate >= 0.85 
                        ? 'text-green-600 dark:text-green-400 font-medium' 
                        : stat.successRate >= 0.80
                        ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                        : 'text-red-600 dark:text-red-400 font-medium'
                    }>
                      {(stat.successRate * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {(stat.falsePositiveRate * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-orange-600 dark:text-orange-400">
                    {(stat.falseNegativeRate * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">{stat.avgLatency}ms</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{stat.model}</Badge>
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
