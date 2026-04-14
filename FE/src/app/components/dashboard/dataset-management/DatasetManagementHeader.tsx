import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../../ui/loading-spinner";

type UploadResult = {
  success: boolean;
  message: string;
  detectedLanguage?: string;
  savedFilename?: string;
  savedPath?: string;
  textLength?: number;
  forwardedTo5000?: boolean;
  pythonResponse?: unknown;
  forwardError?: string;
  error?: string;
};

type Props = {
  onUploadSuccess: () => Promise<void> | void;
};

const UPLOAD_STEPS = [
  "Đang tải file PDF lên hệ thống...",
  "Đang trích xuất và phân tích nội dung tài liệu...",
  "Đang nhận diện ngôn ngữ của tài liệu...",
  "Đang lưu dữ liệu vào tập tài liệu...",
  "Đang gửi sang backend xử lý chỉ mục...",
  "Đang khởi tạo thông tin tìm kiếm và cập nhật dữ liệu...",
];

export default function DatasetManagementHeader({ onUploadSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadStepIndex, setUploadStepIndex] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    if (!uploading) {
      setUploadStepIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setUploadStepIndex((prev) => {
        if (prev >= UPLOAD_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 1400);

    return () => window.clearInterval(interval);
  }, [uploading]);

  const handleUploadClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleCloseResult = () => {
    setUploadResult(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);
    setUploadStepIndex(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/qa/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Upload failed");
      }

      setUploadResult({
        success: true,
        message: data.message || "Upload thành công",
        detectedLanguage: data.detectedLanguage,
        savedFilename: data.savedFilename,
        savedPath: data.savedPath,
        textLength: data.textLength,
        forwardedTo5000: data.forwardedTo5000,
        pythonResponse: data.pythonResponse,
        forwardError: data.forwardError,
      });

      await onUploadSuccess();
    } catch (err: any) {
      setUploadResult({
        success: false,
        message: "Upload thất bại",
        error: err?.message || "Unknown error",
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Dataset Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and explore source PDF documents for multilingual semantic
            search evaluation
          </p>
        </div>

        <div className="shrink-0">
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="inline-flex min-w-[140px] items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner size={16} />
                Uploading...
              </span>
            ) : (
              "Add PDF"
            )}
          </button>

          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {uploading && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
              <LoadingSpinner size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Hệ thống đang xử lý tài liệu của bạn
              </div>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {UPLOAD_STEPS[uploadStepIndex]}
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${((uploadStepIndex + 1) / UPLOAD_STEPS.length) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-2 text-xs text-blue-700/80 dark:text-blue-300/80">
                Vui lòng đợi trong khi hệ thống thêm dữ liệu và khởi tạo thông
                tin cần thiết.
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadResult && (
        <div
          className={`relative mt-6 rounded-2xl border p-5 shadow-sm ${
            uploadResult.success
              ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100/40 dark:border-green-900 dark:from-green-950/40 dark:to-green-900/10"
              : "border-red-200 bg-gradient-to-br from-red-50 to-red-100/40 dark:border-red-900 dark:from-red-950/40 dark:to-red-900/10"
          }`}
        >
          <button
            onClick={handleCloseResult}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-500 transition hover:bg-black/5 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close notification"
            title="Close"
          >
            ✕
          </button>

          <div className="mb-4 flex items-center gap-3 pr-10">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-semibold ${
                uploadResult.success
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              {uploadResult.success ? "✓" : "!"}
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {uploadResult.success ? "Upload Completed" : "Upload Failed"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {uploadResult.message}
              </div>
            </div>
          </div>

          {uploadResult.success ? (
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/40">
                <div className="mb-1 text-xs text-gray-500">Language</div>
                <div className="font-medium capitalize">
                  {uploadResult.detectedLanguage || "unknown"}
                </div>
              </div>

              <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/40">
                <div className="mb-1 text-xs text-gray-500">File</div>
                <div className="truncate font-medium">
                  {uploadResult.savedFilename || "N/A"}
                </div>
              </div>

              <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/40">
                <div className="mb-1 text-xs text-gray-500">
                  Extracted Length
                </div>
                <div className="font-medium">
                  {uploadResult.textLength ?? 0} chars
                </div>
              </div>

              <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/40">
                <div className="mb-1 text-xs text-gray-500">
                  Indexing Status
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      uploadResult.forwardedTo5000
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                  >
                    {uploadResult.forwardedTo5000 ? "Indexed" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/40 sm:col-span-2">
                <div className="mb-1 text-xs text-gray-500">Storage Path</div>
                <div className="break-all text-xs opacity-80">
                  {uploadResult.savedPath || "N/A"}
                </div>
              </div>

              {uploadResult.forwardError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 sm:col-span-2">
                  <div className="mb-1 text-xs font-medium">
                    ⚠️ Indexing Warning
                  </div>
                  <div className="text-xs">{uploadResult.forwardError}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-white/70 p-3 text-sm text-red-700 dark:bg-slate-900/40 dark:text-red-300">
              {uploadResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}