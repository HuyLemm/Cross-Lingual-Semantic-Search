import { useState, useEffect } from "react";
import DatasetGroundTruthHeader from "./dataset-ground-truth/DatasetGroundTruthHeader";
import ReliabilitySummaryCards from "./dataset-ground-truth/ReliabilitySummaryCards";
import DatasetOverviewTable from "./dataset-ground-truth/DatasetOverviewTable";
import QAPairValidationTable from "./dataset-ground-truth/QAPairValidationTable";
import TraceabilityVisualization from "./dataset-ground-truth/TraceabilityVisualization";
import ValidationLogicPanel from "./dataset-ground-truth/ValidationLogicPanel";
import SourceViewSheet from "./dataset-ground-truth/SourceViewSheet";
import LoadingSpinner from "../ui/loading-spinner";

import {
  type QAPair,
  type Dataset,
} from "./dataset-ground-truth/datasetGroundTruthData";

export default function DatasetGroundTruth() {
  /* ========================= FILTER STATES ========================= */
  const [selectedDataset, setSelectedDataset] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedExperiment, setSelectedExperiment] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("0.7");
  const [searchQuery, setSearchQuery] = useState("");

  const [availableExperiments, setAvailableExperiments] = useState<string[]>(
    [],
  );
  const shouldShowExpList =
    selectedModel !== "all" && selectedDataset !== "all";

  /* ========================= DATA STATES ========================= */
  const [datasetOverview, setDatasetOverview] = useState<Dataset[]>([]);
  const [qaList, setQAList] = useState<QAPair[]>([]);
  const [qaTotal, setQaTotal] = useState(0);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [selectedQA, setSelectedQA] = useState<QAPair | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
   * RESET PAGE WHEN FILTER CHANGES
   * ===================================================== */
  useEffect(() => {
    setPage(1);
    setQAList([]);
  }, [selectedDataset, selectedModel, selectedExperiment, searchQuery]);

  /* =====================================================
   * RESET EXPERIMENT WHEN DATASET/MODEL CHANGES
   * ===================================================== */
  useEffect(() => {
    setSelectedExperiment("all");
  }, [selectedDataset, selectedModel]);

  /* =====================================================
   * FETCH QA LIST
   * ===================================================== */
  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true; // 👈 guard request mới nhất

    const params = new URLSearchParams();

    if (selectedDataset !== "all") params.set("dataset", selectedDataset);
    if (selectedModel !== "all") params.set("model", selectedModel);
    if (selectedExperiment !== "all")
      params.set("experiment", selectedExperiment);
    if (searchQuery) params.set("search", searchQuery);

    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    setLoadingQA(true);
    setQAList([]); // clear ngay khi fetch start

    fetch(`http://localhost:4000/summary/qa-list?${params}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return; // 👈 ignore stale response

        setQAList(data.items || []);
        setQaTotal(data.total || 0);

        const maxPage = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
      })
      .catch((err) => {
        if (err.name !== "AbortError" && isCurrent) {
          console.error(err);
        }
      })
      .finally(() => {
        if (isCurrent) setLoadingQA(false); // 👈 chỉ request mới nhất mới tắt loading
      });

    return () => {
      isCurrent = false; // 👈 mark request cũ
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
    if (selectedExperiment !== "all")
      params.set("experiment", selectedExperiment);
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
  const handleViewSource = (qa: QAPair) => {
    setSelectedQA(qa);
    setIsSheetOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const qualityThreshold =
    selectedQuality === "all" ? 0.7 : Number(selectedQuality);

  const globalLoading = loadingOverview || loadingMetrics || loadingExperiments;

  /* =====================================================
   * RENDER
   * ===================================================== */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <DatasetGroundTruthHeader
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
        onSearchChange={setSearchQuery}
      />

      {/* METRICS */}
      {loadingMetrics ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size={26} />
        </div>
      ) : (
        <ReliabilitySummaryCards {...metrics} />
      )}

      {/* OVERVIEW */}
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

      {/* QA TABLE */}
      <QAPairValidationTable
        qaPairs={qaList}
        totalQAPairs={qaTotal}
        page={page}
        pageSize={PAGE_SIZE}
        qualityThreshold={qualityThreshold}
        searchQuery={searchQuery}
        loading={loadingQA}
        onSearchChange={setSearchQuery}
        onPageChange={handlePageChange}
        onViewSource={handleViewSource}
      />

      <TraceabilityVisualization />
      <ValidationLogicPanel />

      <SourceViewSheet
        qa={selectedQA}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* GLOBAL OVERLAY LOADING */}
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
