import { useCallback, useEffect, useState } from "react";
import DatasetManagementHeader from "./dataset-management/DatasetManagementHeader";
import DatasetFilesStats from "./dataset-management/DatasetFilesStats";
import LanguageSelector from "./dataset-management/LanguageSelector";
import PDFFilesList from "./dataset-management/PDFFilesList";
import ProcessingPipeline from "./dataset-management/ProcessingPipeline";
import LoadingSpinner from "../ui/loading-spinner";

type DatasetStats = {
  totalDocs: number;
  englishDocs: number;
  vietnameseDocs: number;
  totalBytes: number;
};

const API_BASE = "http://localhost:4000";

export default function DatasetManagement() {
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "vietnamese">("english");
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingStats(true);

      const res = await fetch(`${API_BASE}/dataset/stats`, {
        cache: "no-store",
        signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as DatasetStats;
      setStats(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Failed to load dataset stats:", e);
        setStats(null);
      }
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadStats(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadStats]);

  const handleUploadSuccess = async () => {
    await loadStats();
  };

  const handleRemoveSuccess = async () => {
    await loadStats();
  };

  return (
    <div className="p-6 space-y-6">
      <DatasetManagementHeader onUploadSuccess={handleUploadSuccess} />

      {loadingStats ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size={26} />
        </div>
      ) : (
        <DatasetFilesStats stats={stats} />
      )}

      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <PDFFilesList
        selectedLanguage={selectedLanguage}
        apiBase={API_BASE}
        onRemoveSuccess={handleRemoveSuccess}
      />

      <ProcessingPipeline />
    </div>
  );
}