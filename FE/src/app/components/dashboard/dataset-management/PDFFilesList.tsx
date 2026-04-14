import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  HardDrive,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useEffect, useMemo, useState } from "react";
import PDFViewerModal from "./PDFViewerModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface PDFFilesListProps {
  selectedLanguage: "english" | "vietnamese";
  apiBase: string;
  onRemoveSuccess?: () => Promise<void> | void;
}

type ApiFile = {
  name: string;
  relativePath: string;
  sizeBytes: number;
  updatedAt: string;
};

type ApiResponse = {
  language: string;
  datasetDir: string;
  count: number;
  files: ApiFile[];
};

type UIFile = {
  id: string;
  name: string;
  sizeBytes: number;
  sizeLabel: string;
  pages: number | null;
  date: string;
  category: string;
  relativePath: string;
};

type PageItem = number | "ellipsis";

type PdfMeta = {
  dataset: string;
  pdfName: string;
  sizeBytes: number;
  pages: number | null;
  pageNumber: number | null;
  chunk_id: string | null;
  pdfUrl: string;
  downloadUrl: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function toDateLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildPagination(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const clamp = (x: number) => Math.max(1, Math.min(total, x));
  const c = clamp(current);

  const items: PageItem[] = [];
  const first = 1;
  const last = total;

  const left = Math.max(2, c - 1);
  const right = Math.min(total - 1, c + 1);

  items.push(first);

  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push("ellipsis");

  items.push(last);
  return items;
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();

  const parts: React.ReactNode[] = [];
  let start = 0;

  while (true) {
    const idx = lowerText.indexOf(lowerQ, start);
    if (idx === -1) break;

    if (idx > start) parts.push(text.slice(start, idx));

    const match = text.slice(idx, idx + q.length);
    parts.push(
      <mark
        key={`${idx}-${match}`}
        className="px-1 rounded bg-yellow-200/70 dark:bg-yellow-500/30 text-gray-900 dark:text-white"
      >
        {match}
      </mark>,
    );

    start = idx + q.length;
  }

  if (start < text.length) parts.push(text.slice(start));
  return <>{parts}</>;
}

export default function PDFFilesList({
  selectedLanguage,
  apiBase,
  onRemoveSuccess,
}: PDFFilesListProps) {
  const [rawFiles, setRawFiles] = useState<ApiFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfMeta, setPdfMeta] = useState<PdfMeta | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<UIFile | null>(null);

  const itemsPerPage = 5;

  const datasetFolder =
    selectedLanguage === "vietnamese" ? "articles_vi" : "articles_en";

  async function fetchFiles(lang: "english" | "vietnamese") {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/dataset/list?language=${lang}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ApiResponse;
      setRawFiles(Array.isArray(data.files) ? data.files : []);
    } catch (e: any) {
      console.error("Failed to load pdf list:", e);
      setRawFiles([]);
      setError(e?.message ? String(e.message) : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchFiles(selectedLanguage);
  }, [selectedLanguage]);

  const files: UIFile[] = useMemo(() => {
    return rawFiles.map((f) => ({
      id: f.relativePath || f.name,
      name: f.name,
      sizeBytes: f.sizeBytes ?? 0,
      sizeLabel: formatBytes(f.sizeBytes ?? 0),
      pages: null,
      date: toDateLabel(f.updatedAt || ""),
      category: "PDF",
      relativePath: f.relativePath,
    }));
  }, [rawFiles]);

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(q) ||
        file.category.toLowerCase().includes(q),
    );
  }, [files, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFiles.length / itemsPerPage),
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  async function fetchDocMetaOnly(pdfName: string): Promise<PdfMeta> {
    const params = new URLSearchParams();
    params.set("dataset", datasetFolder);
    params.set("pdf", pdfName);

    const res = await fetch(`${apiBase}/qa/doc-meta?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data?.error || "Failed to load PDF meta");
    return data as PdfMeta;
  }

  async function openPdfModal(pdfName: string) {
    setIsPdfOpen(true);
    setPdfLoading(true);
    setPdfError(null);
    setPdfMeta(null);

    try {
      const meta = await fetchDocMetaOnly(pdfName);
      setPdfMeta(meta);
    } catch (e: any) {
      setPdfError(e?.message || "Failed to load PDF meta");
    } finally {
      setPdfLoading(false);
    }
  }

  const handleView = (file: UIFile) => {
    openPdfModal(file.name);
  };

  const handleDownload = async (file: UIFile) => {
    try {
      const meta = await fetchDocMetaOnly(file.name);
      const href = meta?.downloadUrl ? `${apiBase}${meta.downloadUrl}` : "";
      if (href) window.open(href, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
    }
  };

  const openRemoveDialog = (file: UIFile) => {
    setFileToRemove(file);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!fileToRemove) return;

    try {
      setDeletingFile(fileToRemove.id);
      setError(null);

      const res = await fetch(`${apiBase}/qa/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          filename: fileToRemove.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || "Failed to remove file",
        );
      }

      setRawFiles((prev) =>
        prev.filter((item) => item.name !== fileToRemove.name),
      );

      if (onRemoveSuccess) {
        await onRemoveSuccess();
      }

      setRemoveDialogOpen(false);
      setFileToRemove(null);
    } catch (e: any) {
      console.error("Failed to remove pdf:", e);
      setError(e?.message ? String(e.message) : "Failed to remove file");
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="min-w-0">
              {selectedLanguage === "english" ? "English" : "Vietnamese"} PDF
              Documents{" "}
              <span className="text-gray-500 dark:text-gray-400">
                ({filteredFiles.length})
              </span>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFiles(selectedLanguage)}
                disabled={loading}
                className="h-9"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by filename..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Loading documents...
              </div>
            ) : paginatedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents found matching your search.</p>
              </div>
            ) : (
              paginatedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        <HighlightText text={file.name} query={searchQuery} />
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                          <HardDrive className="w-3 h-3" />
                          <span>{file.sizeLabel}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{file.date || "—"}</span>
                        </div>

                        <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                          <HighlightText
                            text={file.category}
                            query={searchQuery}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => handleView(file)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => openRemoveDialog(file)}
                      disabled={deletingFile === file.id}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && filteredFiles.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredFiles.length)} of{" "}
                {filteredFiles.length} documents
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {buildPagination(currentPage, totalPages).map((item, idx) => {
                    if (item === "ellipsis") {
                      return (
                        <span
                          key={`e-${idx}`}
                          className="px-2 text-sm text-gray-500 dark:text-gray-400"
                        >
                          …
                        </span>
                      );
                    }
                    const page = item;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 px-3"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PDFViewerModal
        open={isPdfOpen}
        apiBase={apiBase}
        meta={pdfMeta}
        loading={pdfLoading}
        error={pdfError}
        onClose={() => {
          setIsPdfOpen(false);
          setPdfMeta(null);
          setPdfError(null);
        }}
      />

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] overflow-hidden">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle>Remove PDF file?</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  This action will permanently delete the selected PDF from the
                  dataset.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {fileToRemove && (
            <div className="max-w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="font-medium text-slate-900 dark:text-white break-words whitespace-normal leading-6">
                {fileToRemove.name}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {fileToRemove.sizeLabel} • {fileToRemove.date || "No date"}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={!!deletingFile}
              onClick={() => setFileToRemove(null)}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRemove();
              }}
              disabled={!!deletingFile}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingFile ? "Removing..." : "Yes, remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
