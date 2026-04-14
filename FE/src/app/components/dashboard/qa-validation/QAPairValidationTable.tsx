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
import { Eye, Pin } from "lucide-react";
import LoadingSpinner from "../../ui/loading-spinner";
import type { QAPair } from "./QAValidationData";

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

  // ✅ NEW: split actions
  onOpenPdf: (qa: QAPair) => void; // click source pdf badge
  onViewDetails: (qa: QAPair) => void; // click View button
}

/* =========================
 * VERIFIED LOGIC (FINAL)
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
    if (offset > lastIndex) result.push(text.slice(lastIndex, offset));

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

  if (lastIndex < text.length) result.push(text.slice(lastIndex));
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
  onOpenPdf,
  onViewDetails,
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

        {/* TABLE ONLY SCROLL */}
        <div className="w-full overflow-x-auto border rounded-lg">
          <Table className="min-w-[1200px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">QA ID</TableHead>
                <TableHead className="w-[280px]">Question</TableHead>
                <TableHead className="w-[280px]">Ground Truth Answer</TableHead>
                <TableHead className="w-[280px]">Source Document</TableHead>
                <TableHead className="w-[120px] text-center">
                  Chunk ID
                </TableHead>
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
                const chunkId = qa.chunk_id ?? "—";

                return (
                  <TableRow key={qa.id}>
                    <TableCell className="font-mono text-xs break-all">
                      {qa.id}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm break-words whitespace-normal">
                        {highlight(qa.question, searchQuery)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400 break-words whitespace-normal">
                        {highlight(qa.answer, searchQuery)}
                      </div>
                    </TableCell>

                    {/* ✅ click badge -> PDF modal */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => onOpenPdf(qa)}
                        className="group w-full text-left"
                      >
                        <Badge
                          className="
        flex items-center gap-2
        bg-blue-50 text-blue-700
        dark:bg-blue-900/30 dark:text-blue-300
        hover:bg-blue-100 dark:hover:bg-blue-900/50
        cursor-pointer
        transition
        px-3 py-2
        text-sm
        font-medium
        whitespace-normal break-words
      "
                        >
                          <Pin className="!w-4 !h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                          <span className="group-hover:underline">
                            {highlight(
                              qa.sourceDocument ?? "Unknown",
                              searchQuery,
                            )}
                          </span>
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="font-mono text-[12px]"
                      >
                        {highlight(String(chunkId), searchQuery)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {qa.language.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          bi >= qualityThreshold
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {bi.toFixed(3)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          ce >= qualityThreshold
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {ce.toFixed(3)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {getStatusBadge(status)}
                    </TableCell>

                    {/* ✅ View button -> SourceViewSheet */}
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(qa)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {loading && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10">
                    <div className="flex justify-center">
                      <LoadingSpinner size={26} />
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading && qaPairs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-10 text-gray-500"
                  >
                    No QA pairs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="mt-4 mb-2 flex justify-center">
          <div className="flex items-center gap-1 text-sm flex-nowrap overflow-x-auto max-w-full px-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              ‹
            </Button>

            {pages.map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="px-2 text-gray-400 select-none"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${p}-${i}`}
                  size="sm"
                  variant={Number(p) === page ? "default" : "outline"}
                  onClick={() => onPageChange(Number(p))}
                >
                  {p}
                </Button>
              ),
            )}

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
