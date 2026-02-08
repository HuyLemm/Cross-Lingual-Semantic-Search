import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Eye } from 'lucide-react';
import type { QAPair } from './datasetGroundTruthData';

interface QAPairValidationTableProps {
  qaPairs: QAPair[];
  totalQAPairs: number;
  onViewSource: (qa: QAPair) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Verified':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Verified</Badge>;
    case 'Low Similarity':
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Low Similarity</Badge>;
    case 'Language Mismatch':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Language Mismatch</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function QAPairValidationTable({
  qaPairs,
  totalQAPairs,
  onViewSource,
}: QAPairValidationTableProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>QA Pairs Validation</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Core trust evidence: every QA pair is traceable to source documents
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {qaPairs.length} of {totalQAPairs} QA pairs
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>QA ID</TableHead>
              <TableHead className="min-w-[250px]">Question</TableHead>
              <TableHead className="min-w-[300px]">Ground Truth Answer</TableHead>
              <TableHead>Source Chunk ID</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="text-right">Similarity Score</TableHead>
              <TableHead className="text-center">Verification Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qaPairs.map((qa) => (
              <TableRow key={qa.id}>
                <TableCell className="font-mono text-sm">{qa.id}</TableCell>
                <TableCell>
                  <div className="text-sm max-w-[250px]">{qa.question}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[300px] line-clamp-2">
                    {qa.answer}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {qa.sourceChunkId}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">{qa.language}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={
                    qa.similarityScore >= 0.85 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : qa.similarityScore >= 0.75
                      ? 'text-orange-600 dark:text-orange-400 font-medium'
                      : 'text-red-600 dark:text-red-400 font-medium'
                  }>
                    {qa.similarityScore.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(qa.verificationStatus)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewSource(qa)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Source
                    </Button>
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
