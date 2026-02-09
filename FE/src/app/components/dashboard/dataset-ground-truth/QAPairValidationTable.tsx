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
import { Eye } from 'lucide-react';
import type { QAPair } from './datasetGroundTruthData';

interface QAPairValidationTableProps {
  qaPairs: QAPair[];
  totalQAPairs: number;
  onViewSource: (qa: QAPair) => void;
}

/* =========================
 * VERIFIED LOGIC
 * ========================= */
function getVerificationStatus(qa: QAPair) {
  const bi = qa.sim_qc ?? 0;
  const ce = qa.ce_multi_prob ?? 0;

  if (bi >= 0.7 && ce >= 0.7) return 'Verified';
  if (bi < 0.7) return 'Low Similarity';
  return 'Low Cross-Encoder';
}

/* =========================
 * STATUS BADGE
 * ========================= */
function getStatusBadge(status: string) {
  switch (status) {
    case 'Verified':
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Verified
        </Badge>
      );

    case 'Low Similarity':
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Low Similarity
        </Badge>
      );

    case 'Low Cross-Encoder':
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Low CE
        </Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function QAPairValidationTable({
  qaPairs = [],
  totalQAPairs = 0,
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
              <TableHead className="min-w-[300px]">
                Ground Truth Answer
              </TableHead>

              {/* Source PDF */}
              <TableHead>Source Document</TableHead>

              <TableHead>Language</TableHead>

              <TableHead className="text-right">Bi-Encoder</TableHead>
              <TableHead className="text-right">Cross-Encoder</TableHead>

              <TableHead className="text-center">
                Verification Status
              </TableHead>

              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {qaPairs.map((qa) => {
              const status = getVerificationStatus(qa);

              const bi = qa.sim_qc ?? 0;
              const ce = qa.ce_multi_prob ?? 0;

              return (
                <TableRow key={qa.id}>
                  {/* QA ID */}
                  <TableCell className="font-mono text-sm">
                    {qa.id}
                  </TableCell>

                  {/* Question */}
                  <TableCell>
                    <div className="text-sm max-w-[250px] line-clamp-2">
                      {qa.question}
                    </div>
                  </TableCell>

                  {/* Answer */}
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[300px] line-clamp-2">
                      {qa.answer}
                    </div>
                  </TableCell>

                  {/* Source PDF */}
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {qa.sourceDocument ?? 'Unknown'}
                    </Badge>
                  </TableCell>

                  {/* Language */}
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {qa.language.toUpperCase()}
                    </Badge>
                  </TableCell>

                  {/* Bi Encoder */}
                  <TableCell className="text-right">
                    <span
                      className={
                        bi >= 0.7
                          ? 'text-green-600 font-medium'
                          : 'text-red-500 font-medium'
                      }
                    >
                      {bi.toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Cross Encoder */}
                  <TableCell className="text-right">
                    <span
                      className={
                        ce >= 0.7
                          ? 'text-green-600 font-medium'
                          : 'text-red-500 font-medium'
                      }
                    >
                      {ce.toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Verification */}
                  <TableCell className="text-center">
                    {getStatusBadge(status)}
                  </TableCell>

                  {/* Action */}
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
              );
            })}

            {qaPairs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  No QA pairs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
