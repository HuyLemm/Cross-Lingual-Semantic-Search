import { X, Download, FileText } from "lucide-react";
import { Button } from "../../ui/button";
import LoadingSpinner from "../../ui/loading-spinner";

type PdfMeta = {
  dataset: string;
  pdfName: string;
  sizeBytes: number;
  pages: number | null;
  pageNumber: number | null;
  chunk_id: string | null;
  pdfUrl: string; // "/dataset/pdf?...."
  downloadUrl: string; // "/dataset/pdf?....&download=1"
};

interface PDFViewerModalProps {
  open: boolean;
  apiBase: string;          
  meta: PdfMeta | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
}

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function PDFViewerModal({
  open,
  apiBase,
  meta,
  loading = false,
  error = null,
  onClose,
}: PDFViewerModalProps) {
  if (!open) return null;

  const pdfName = meta?.pdfName ?? "Unknown.pdf";
  const sizeText = meta?.sizeBytes !== undefined ? formatBytes(meta.sizeBytes) : "—";
  const pagesText = meta?.pages ?? "—";
  const pageNumber = meta?.pageNumber ?? "—";
  const chunkId = meta?.chunk_id ?? "—";

  const pdfSrc = meta?.pdfUrl ? `${apiBase}${meta.pdfUrl}` : "";
  const downloadHref = meta?.downloadUrl ? `${apiBase}${meta.downloadUrl}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>

            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {pdfName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {sizeText} • {pagesText} pages 
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => {
                if (!downloadHref) return;
                window.open(downloadHref, "_blank", "noopener,noreferrer");
              }}
              disabled={!downloadHref || loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* PDF Area */}
        <div className="flex-1 bg-gray-100 dark:bg-slate-950 overflow-hidden">
          <div className="h-full w-full p-4">
            <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner size={28} />
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center p-6">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : !pdfSrc ? (
                <div className="h-full flex items-center justify-center p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    PDF source not available.
                  </p>
                </div>
              ) : (
                <iframe title="pdf-viewer" src={pdfSrc} className="w-full h-full" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}