import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Eye } from "lucide-react";
import LoadingSpinner from "../../ui/loading-spinner";
import type { QAPair } from "./datasetGroundTruthData";

interface QAPairValidationTableProps {
  qaPairs: QAPair[];
  totalQAPairs: number;
  page: number;
  pageSize: number;
  qualityThreshold: number;
  searchQuery: string;
  loading?: boolean;
  onSearchChange: (v: string) => void;
  onPageChange: (page: number) => void;
  onViewSource: (qa: QAPair) => void;
}

/* =========================
 * VERIFIED LOGIC (FINAL)
 *
 * Rules:
 * - Bi >= 0.7 AND CE >= 0.7 → Verified
 * - Bi < 0.7  AND CE >= 0.7 → Low Similarity
 * - Bi >= 0.7 AND CE < 0.7  → Low Cross-Encoder
 * - Bi < 0.7  AND CE < 0.7  → Weak Both
 * ========================= */
function getVerificationStatus(qa: QAPair, th: number) {
  const bi = qa.sim_qc ?? 0;
  const ce = qa.ce_multi_prob ?? 0;

  if (bi >= th && ce >= th) return "Verified";
  if (bi < th && ce >= th) return "Low Similarity";
  if (bi >= th && ce < th) return "Low Cross-Encoder";
  return "Weak Both";
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* =========================
 * MULTI KEYWORD HIGHLIGHT
 * ========================= */
function highlight(text: string, keyword: string) {
  if (!keyword) return text;

  const words = keyword.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);

  if (words.length === 0) return text;

  const regex = new RegExp(`(${words.join("|")})`, "gi");

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(regex, (match, _p1, offset) => {
    if (offset > lastIndex) {
      result.push(text.slice(lastIndex, offset));
    }

    result.push(
      <mark
        key={offset}
        className="bg-yellow-200 dark:bg-yellow-600 px-[2px] rounded"
      >
        {match}
      </mark>,
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/* =========================
 * STATUS BADGE
 * ========================= */
function getStatusBadge(status: string) {
  switch (status) {
    case "Verified":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Verified
        </Badge>
      );

    case "Low Similarity":
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Low Similarity
        </Badge>
      );

    case "Low Cross-Encoder":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Low CE
        </Badge>
      );

    case "Weak Both":
      return (
        <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Weak Both
        </Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function QAPairValidationTable({
  qaPairs = [],
  totalQAPairs = 0,
  page,
  pageSize,
  qualityThreshold,
  searchQuery,
  loading = false,
  onSearchChange,
  onPageChange,
  onViewSource,
}: QAPairValidationTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalQAPairs / pageSize));

  const start = totalQAPairs === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalQAPairs);

  /* ===== BUILD PAGE LIST (1 2 ... LAST) ===== */
  const pages: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2);

    if (page > 4) pages.push("...");

    const midStart = Math.max(3, page - 1);
    const midEnd = Math.min(totalPages - 2, page + 1);

    for (let i = midStart; i <= midEnd; i++) pages.push(i);

    if (page < totalPages - 3) pages.push("...");

    pages.push(totalPages);
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div>
          <CardTitle>QA Pairs Validation</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Core trust evidence: every QA pair is traceable to source documents
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* SEARCH + INFO */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {start}–{end} of {totalQAPairs} QA pairs
          </div>

          <Input
            placeholder="Search question, answer, or source..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[300px] h-9 text-sm"
          />
        </div>

        {/* SCROLL WRAPPER */}
        <div className="w-full overflow-x-auto border rounded-lg">
          <Table className="min-w-[1100px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">QA ID</TableHead>
                <TableHead className="w-[280px]">Question</TableHead>
                <TableHead className="w-[280px]">Ground Truth Answer</TableHead>
                <TableHead className="w-[280px]">Source Document</TableHead>
                <TableHead className="w-[80px] text-center">Lang</TableHead>
                <TableHead className="w-[80px] text-right">
                  Bi-Encoder
                </TableHead>
                <TableHead className="w-[80px] text-right">
                  Cross-Encoder
                </TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[100px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {qaPairs.map((qa) => {
                const status = getVerificationStatus(qa, qualityThreshold);
                const bi = qa.sim_qc ?? 0;
                const ce = qa.ce_multi_prob ?? 0;

                return (
                  <TableRow key={qa.id}>
                    {/* QA ID */}
                    <TableCell className="font-mono text-xs break-all">
                      {qa.id}
                    </TableCell>

                    {/* Question */}
                    <TableCell>
                      <div className="text-sm break-words whitespace-normal">
                        {highlight(qa.question, searchQuery)}
                      </div>
                    </TableCell>

                    {/* Answer */}
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400 break-words whitespace-normal">
                        {highlight(qa.answer, searchQuery)}
                      </div>
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="block text-[12px] whitespace-normal break-words leading-tight"
                      >
                        {highlight(qa.sourceDocument ?? "Unknown", searchQuery)}
                      </Badge>
                    </TableCell>

                    {/* Language */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {qa.language.toUpperCase()}
                      </Badge>
                    </TableCell>

                    {/* Bi Encoder */}
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          bi >= qualityThreshold
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {bi.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Cross Encoder */}
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          ce >= qualityThreshold
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {ce.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Status */}
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
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* LOADING FIRST */}
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10">
                    <div className="flex justify-center">
                      <LoadingSpinner size={26} />
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* EMPTY ONLY WHEN NOT LOADING */}
              {!loading && qaPairs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-10 text-gray-500"
                  >
                    No QA pairs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* ================= PAGINATION ================= */}
          {/* PAGINATION */}
          <div className="flex items-center justify-center mt-4 gap-1 text-sm mb-4">
            {/* PREV */}
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              ‹
            </Button>

            {/* PAGE NUMBERS */}
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "default" : "outline"}
                  onClick={() => onPageChange(Number(p))}
                >
                  {p}
                </Button>
              ),
            )}

            {/* NEXT */}
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
