import { useState, useEffect } from "react";
import DatasetGroundTruthHeader from "./dataset-ground-truth/DatasetGroundTruthHeader";
import ReliabilitySummaryCards from "./dataset-ground-truth/ReliabilitySummaryCards";
import DatasetOverviewTable from "./dataset-ground-truth/DatasetOverviewTable";
import QAPairValidationTable from "./dataset-ground-truth/QAPairValidationTable";
import TraceabilityVisualization from "./dataset-ground-truth/TraceabilityVisualization";
import ValidationLogicPanel from "./dataset-ground-truth/ValidationLogicPanel";
import SourceViewSheet from "./dataset-ground-truth/SourceViewSheet";
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

  const [availableExperiments, setAvailableExperiments] = useState<string[]>([]);
  const shouldShowExpList =
    selectedModel !== "all" && selectedDataset !== "all";

  /* ========================= DATA STATES ========================= */
  const [datasetOverview, setDatasetOverview] = useState<Dataset[]>([]);
  const [qaList, setQAList] = useState<QAPair[]>([]);
  const [qaTotal, setQaTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [selectedQA, setSelectedQA] = useState<QAPair | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
   * RESET PAGE + CLEAR DATA WHEN FILTER CHANGES
   * ===================================================== */
  useEffect(() => {
    setPage(1);
    setQAList([]); // ⭐ tránh flash data cũ
  }, [selectedDataset, selectedModel, selectedExperiment, searchQuery]);

  /* =====================================================
   * RESET EXPERIMENT WHEN DATASET/MODEL CHANGES
   * ===================================================== */
  useEffect(() => {
    setSelectedExperiment("all");
  }, [selectedDataset, selectedModel]);

  /* =====================================================
   * FETCH QA LIST (WITH ABORT CONTROLLER)
   * ===================================================== */
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const params = new URLSearchParams();

    if (selectedDataset !== "all") params.set("dataset", selectedDataset);
    if (selectedModel !== "all") params.set("model", selectedModel);
    if (selectedExperiment !== "all")
      params.set("experiment", selectedExperiment);
    if (searchQuery) params.set("search", searchQuery);

    params.set("page", String(page));
    params.set("pageSize", "20");

    fetch(`http://localhost:4000/summary/qa-list?${params}`, { signal })
      .then((res) => res.json())
      .then((data) => {
        setQAList(data.items || []);
        setQaTotal(data.total || 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort(); // ⭐ kill request cũ
  }, [selectedDataset, selectedModel, selectedExperiment, searchQuery, page]);

  /* =====================================================
   * DATASET OVERVIEW (STATIC)
   * ===================================================== */
  useEffect(() => {
    fetch(`http://localhost:4000/summary/dataset-overview`)
      .then((res) => res.json())
      .then(setDatasetOverview)
      .catch(console.error);
  }, []);

  /* =====================================================
   * FETCH EXPERIMENT LIST
   * ===================================================== */
  useEffect(() => {
    if (!shouldShowExpList) {
      setAvailableExperiments([]);
      return;
    }

    const controller = new AbortController();

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
      });

    return () => controller.abort();
  }, [selectedModel, selectedDataset, shouldShowExpList]);

  /* =====================================================
   * FETCH SUMMARY METRICS
   * ===================================================== */
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (selectedDataset !== "all") params.set("dataset", selectedDataset);
    if (selectedModel !== "all") params.set("model", selectedModel);
    if (selectedExperiment !== "all")
      params.set("experiment", selectedExperiment);
    if (selectedQuality !== "all") params.set("quality", selectedQuality);

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
      });

    return () => controller.abort();
  }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);

  /* =====================================================
   * HANDLER
   * ===================================================== */
  const handleViewSource = (qa: QAPair) => {
    setSelectedQA(qa);
    setIsSheetOpen(true);
  };

  /* =====================================================
   * RENDER
   * ===================================================== */
  return (
    <div className="p-6 space-y-6">
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

      <ReliabilitySummaryCards {...metrics} />

      <DatasetOverviewTable datasets={datasetOverview} />

      <QAPairValidationTable
        qaPairs={qaList}
        totalQAPairs={qaTotal}
        onViewSource={handleViewSource}
      />

      <TraceabilityVisualization />
      <ValidationLogicPanel />

      <SourceViewSheet
        qa={selectedQA}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
