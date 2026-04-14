import { useState, useEffect } from "react";
import QAValidationHeader from "./qa-validation/QAValidationHeader";
import ReliabilitySummaryCards from "./qa-validation/ReliabilitySummaryCards";
import DatasetOverviewTable from "./qa-validation/QAOverviewTable";
import QAPairValidationTable from "./qa-validation/QAPairValidationTable";
import ValidationLogicPanel from "./qa-validation/ValidationLogicPanel";
import SourceViewSheet from "./qa-validation/SourceViewSheet";
import LoadingSpinner from "../ui/loading-spinner";

import { type QAPair, type Dataset } from "./qa-validation/QAValidationData";

import QAPairPDFViewerModal from "./qa-validation/QAPairPDFViewerModal";

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

const API_BASE = "http://localhost:4000";

function resolveDatasetFolder(selectedDataset: string, qa: QAPair) {
  if (selectedDataset === "articles_en" || selectedDataset === "articles_vi") {
    return selectedDataset;
  }
  const lang = (qa.language || "").toLowerCase();
  if (lang === "vi") return "articles_vi";
  return "articles_en";
}

export default function QAValidation() {
  /* ========================= FILTER STATES ========================= */
  const [selectedDataset, setSelectedDataset] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedExperiment, setSelectedExperiment] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("0.7");
  const [searchQuery, setSearchQuery] = useState("");

  const [availableExperiments, setAvailableExperiments] = useState<string[]>([]);
  const shouldShowExpList = selectedModel !== "all" && selectedDataset !== "all";

  /* ========================= DATA STATES ========================= */
  const [datasetOverview, setDatasetOverview] = useState<Dataset[]>([]);
  const [qaList, setQAList] = useState<QAPair[]>([]);
  const [qaTotal, setQaTotal] = useState(0);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* ========================= SHEET STATES (View button) ========================= */
  const [selectedQA, setSelectedQA] = useState<QAPair | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  /* ========================= PDF MODAL STATES (Source badge) ========================= */
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfMeta, setPdfMeta] = useState<PdfMeta | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  /* ========================= LOADING STATES ========================= */
  const [loadingQA, setLoadingQA] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingExperiments, setLoadingExperiments] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);

  /* ========================= SUMMARY METRICS ========================= */
  const [metrics, setMetrics] = useState({
    totalDocuments: 0,
    totalQAPairs: 0,
    verifiedQAPairs: 0,
    avgBiEncoder: 0,
    avgCrossEncoder: 0,
    step1OnlyRate: 0,
    validationRate: 0,
  });

  /* =====================================================
   * RESET PAGE WHEN FILTER CHANGES (KHÔNG reset theo searchQuery)
   * ===================================================== */
  useEffect(() => {
    setPage(1);
    setQAList([]);
  }, [selectedDataset, selectedModel, selectedExperiment]);

  /* =====================================================
   * RESET EXPERIMENT WHEN DATASET/MODEL CHANGES
   * ===================================================== */
  useEffect(() => {
    setSelectedExperiment("all");
  }, [selectedDataset, selectedModel]);

  /* =====================================================
   * SEARCH HANDLER: reset page ngay lập tức
   * ===================================================== */
  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    setPage(1);
    setQAList([]);
  };

  /* =====================================================
   * FETCH QA LIST
   * ===================================================== */
  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    const params = new URLSearchParams();
    if (selectedDataset !== "all") params.set("dataset", selectedDataset);
    if (selectedModel !== "all") params.set("model", selectedModel);
    if (selectedExperiment !== "all") params.set("experiment", selectedExperiment);
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    setLoadingQA(true);
    setQAList([]);

    fetch(`http://localhost:4000/summary/qa-list?${params}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;

        setQAList(data.items || []);
        const total = data.totalQAPairs ?? data.total ?? 0;
        setQaTotal(total);

        const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
      })
      .catch((err) => {
        if (err.name !== "AbortError" && isCurrent) console.error(err);
      })
      .finally(() => {
        if (isCurrent) setLoadingQA(false);
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [selectedDataset, selectedModel, selectedExperiment, searchQuery, page]);

  /* =====================================================
   * DATASET OVERVIEW
   * ===================================================== */
  useEffect(() => {
    setLoadingOverview(true);

    fetch(`http://localhost:4000/summary/dataset-overview`)
      .then((res) => res.json())
      .then(setDatasetOverview)
      .catch(console.error)
      .finally(() => setLoadingOverview(false));
  }, [selectedQuality]);

  /* =====================================================
   * FETCH EXPERIMENT LIST
   * ===================================================== */
  useEffect(() => {
    if (!shouldShowExpList) {
      setAvailableExperiments([]);
      return;
    }

    const controller = new AbortController();
    setLoadingExperiments(true);

    fetch(
      `http://localhost:4000/summary/experiments?model=${selectedModel}&dataset=${selectedDataset}`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((list: string[]) => {
        const sorted = list.sort(
          (a, b) => Number(a.replace("exp", "")) - Number(b.replace("exp", "")),
        );
        setAvailableExperiments(sorted);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoadingExperiments(false));

    return () => controller.abort();
  }, [selectedModel, selectedDataset, shouldShowExpList]);

  /* =====================================================
   * FETCH METRICS
   * ===================================================== */
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (selectedDataset !== "all") params.set("dataset", selectedDataset);
    if (selectedModel !== "all") params.set("model", selectedModel);
    if (selectedExperiment !== "all") params.set("experiment", selectedExperiment);
    if (selectedQuality !== "all") params.set("quality", selectedQuality);

    setLoadingMetrics(true);

    fetch(`http://localhost:4000/summary/get-summary?${params}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) =>
        setMetrics({
          totalDocuments: data.totalDocuments ?? 0,
          totalQAPairs: data.totalQAPairs ?? 0,
          verifiedQAPairs: data.verifiedQAPairs ?? 0,
          avgBiEncoder: data.avgBiEncoder ?? 0,
          avgCrossEncoder: data.avgCrossEncoder ?? 0,
          step1OnlyRate: data.step1OnlyRate ?? 0,
          validationRate: data.validationRate ?? 0,
        }),
      )
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoadingMetrics(false));

    return () => controller.abort();
  }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);

  /* =====================================================
   * HANDLERS
   * ===================================================== */

  // ✅ View button -> Sheet
  const handleViewDetails = (qa: QAPair) => {
    setSelectedQA(qa);
    setIsSheetOpen(true);
  };

  // ✅ Source badge -> PDF Modal
  const handleOpenPdf = async (qa: QAPair) => {
    console.log("open pdf:", qa.sourceDocument, qa.chunk_id); // ✅ debug

    setSelectedQA(qa);
    setIsPdfOpen(true);
    setPdfLoading(true);
    setPdfError(null);
    setPdfMeta(null);

    try {
      const datasetFolder = resolveDatasetFolder(selectedDataset, qa);

      const params = new URLSearchParams();
      params.set("dataset", datasetFolder);
      params.set("pdf", qa.sourceDocument ?? "");
      if (qa.chunk_id) params.set("chunk_id", String(qa.chunk_id));

      const res = await fetch(`${API_BASE}/qa/doc-meta?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to load PDF meta");
      setPdfMeta(data);
    } catch (e: any) {
      setPdfError(e?.message || "Failed to load PDF meta");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const qualityThreshold =
    selectedQuality === "all" ? 0.7 : Number(selectedQuality);
  const globalLoading = loadingOverview || loadingMetrics || loadingExperiments;

  /* =====================================================
   * RENDER
   * ===================================================== */
  return (
    <div className="p-6 space-y-6">
      <QAValidationHeader
        selectedDataset={selectedDataset}
        selectedModel={selectedModel}
        selectedExperiment={selectedExperiment}
        selectedQuality={selectedQuality}
        searchQuery={searchQuery}
        onDatasetChange={setSelectedDataset}
        onModelChange={setSelectedModel}
        onExperimentChange={setSelectedExperiment}
        availableExperiments={availableExperiments}
        shouldShowExpList={shouldShowExpList}
        onQualityChange={setSelectedQuality}
        onSearchChange={handleSearchChange}
      />

      {loadingMetrics ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size={26} />
        </div>
      ) : (
        <ReliabilitySummaryCards {...metrics} />
      )}

      {loadingOverview ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size={26} />
        </div>
      ) : (
        <DatasetOverviewTable
          datasets={datasetOverview}
          threshold={qualityThreshold}
        />
      )}

      <QAPairValidationTable
        qaPairs={qaList}
        totalQAPairs={qaTotal}
        page={page}
        pageSize={PAGE_SIZE}
        qualityThreshold={qualityThreshold}
        searchQuery={searchQuery}
        loading={loadingQA}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onOpenPdf={handleOpenPdf}          // ✅ Source badge
        onViewDetails={handleViewDetails}  // ✅ View button
      />

      <ValidationLogicPanel />

      {/* ✅ SHEET */}
      <SourceViewSheet
        qa={selectedQA}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        threshold={qualityThreshold}
        searchQuery={searchQuery}
      />

      {/* ✅ PDF MODAL */}
      {isPdfOpen && selectedQA && (
        <QAPairPDFViewerModal
          qa={selectedQA}
          meta={pdfMeta}
          loading={pdfLoading}
          error={pdfError}
          onClose={() => {
            setIsPdfOpen(false);
            setPdfMeta(null);
            setPdfError(null);
          }}
        />
      )}

      {globalLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
            <LoadingSpinner size={32} />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Loading data...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}