import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Eye, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Experiment } from './experimentLogsData';
import React from 'react';

interface ExperimentLogsTableProps {
  experiments: Experiment[];
  expandedRow: string | null;
  onToggleExpand: (runId: string) => void;
}

export default function ExperimentLogsTable({ experiments, expandedRow, onToggleExpand }: ExperimentLogsTableProps) {
  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-slate-100">Experiment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-gray-700 dark:text-slate-400"></TableHead>
              <TableHead className="text-gray-700 dark:text-slate-400">Run ID</TableHead>
              <TableHead className="text-gray-700 dark:text-slate-400">Timestamp</TableHead>
              <TableHead className="text-gray-700 dark:text-slate-400">Model</TableHead>
              <TableHead className="text-gray-700 dark:text-slate-400">Dataset</TableHead>
              <TableHead className="text-gray-700 dark:text-slate-400">Index</TableHead>
              <TableHead className="text-right text-gray-700 dark:text-slate-400">Recall@10</TableHead>
              <TableHead className="text-right text-gray-700 dark:text-slate-400">MRR</TableHead>
              <TableHead className="text-right text-gray-700 dark:text-slate-400">Latency (ms)</TableHead>
              <TableHead className="text-gray-700 dark:text-slate-400">Status</TableHead>
              <TableHead className="text-center text-gray-700 dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map((exp) => (
              <React.Fragment key={exp.runId}>
                <TableRow className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700">
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onToggleExpand(exp.runId)}
                      className="dark:hover:bg-slate-700"
                    >
                      {expandedRow === exp.runId ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-900 dark:text-slate-200">{exp.runId}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-slate-400">{exp.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 dark:border-slate-600 dark:text-slate-300">{exp.model}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 dark:text-slate-200">{exp.dataset}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">{exp.indexStrategy}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={exp.recallK10 >= 0.90 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-slate-200'}>
                      {(exp.recallK10 * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-900 dark:text-slate-200">{exp.mrr.toFixed(3)}</TableCell>
                  <TableCell className="text-right text-gray-900 dark:text-slate-200">{exp.latency}ms</TableCell>
                  <TableCell>
                    <Badge variant={exp.status === 'Completed' ? 'default' : 'destructive'} className={exp.status === 'Completed' ? 'bg-slate-700 dark:bg-slate-600' : ''}>
                      {exp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="dark:hover:bg-slate-700">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRow === exp.runId && (
                  <TableRow>
                    <TableCell colSpan={11} className="bg-gray-50 dark:bg-slate-800">
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Configuration Details</h4>
                        <pre className="bg-white dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-200">
                          {JSON.stringify(exp.config, null, 2)}
                        </pre>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                            <Download className="w-4 h-4 mr-2" />
                            Download Config
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                            Reproduce Experiment
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
