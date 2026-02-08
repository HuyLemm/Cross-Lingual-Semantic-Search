import { useState, useMemo, useEffect } from "react";
import DatasetGroundTruthHeader from "./dataset-ground-truth/DatasetGroundTruthHeader";
import ReliabilitySummaryCards from "./dataset-ground-truth/ReliabilitySummaryCards";
import DatasetOverviewTable from "./dataset-ground-truth/DatasetOverviewTable";
import QAPairValidationTable from "./dataset-ground-truth/QAPairValidationTable";
import TraceabilityVisualization from "./dataset-ground-truth/TraceabilityVisualization";
import ValidationLogicPanel from "./dataset-ground-truth/ValidationLogicPanel";
import SourceViewSheet from "./dataset-ground-truth/SourceViewSheet";
import {
  mockQAPairs,
  type QAPair,
  type Dataset,
} from "./dataset-ground-truth/datasetGroundTruthData";

export default function DatasetGroundTruth() {
  const [selectedDataset, setSelectedDataset] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedExperiment, setSelectedExperiment] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("0.7");

  const [availableExperiments, setAvailableExperiments] = useState<string[]>(
    [],
  );

  const [datasetOverview, setDatasetOverview] = useState<Dataset[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQA, setSelectedQA] = useState<QAPair | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const shouldShowExpList =
    selectedModel !== "all" && selectedDataset !== "all";

  // =========================
  // SUMMARY METRICS (FROM BACKEND)
  // =========================
  const [metrics, setMetrics] = useState({
    totalDocuments: 0,
    totalQAPairs: 0,
    verifiedQAPairs: 0,

    avgBiEncoder: 0,
    avgCrossEncoder: 0,
    step1OnlyRate: 0,

    validationRate: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedDataset !== "all") params.set("dataset", selectedDataset);
    if (selectedModel !== "all") params.set("model", selectedModel);
    if (selectedExperiment !== "all")
      params.set("experiment", selectedExperiment);
    if (selectedQuality !== "all") params.set("quality", selectedQuality);

    fetch(`http://localhost:4000/summary/dataset-overview?${params}`)
      .then((res) => res.json())
      .then((data) => setDatasetOverview(data))
      .catch((err) => console.error("Failed to fetch dataset overview", err));
  }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);

  useEffect(() => {
    if (!shouldShowExpList) {
      setAvailableExperiments([]);
      setSelectedExperiment("all");
      return;
    }

    fetch(
      `http://localhost:4000/summary/experiments?model=${selectedModel}&dataset=${selectedDataset}`,
    )
      .then((res) => res.json())
      .then((list: string[]) => {
        const sorted = list.sort((a, b) => {
          const na = Number(a.replace("exp", ""));
          const nb = Number(b.replace("exp", ""));
          return na - nb;
        });

        setAvailableExperiments(sorted);

        if (!sorted.includes(selectedExperiment)) {
          setSelectedExperiment("all");
        }
      })

      .catch(console.error);
  }, [selectedModel, selectedDataset]);

  // =========================
  // FETCH SUMMARY
  // =========================
  useEffect(() => {
    const query = buildSummaryQuery({
      dataset: selectedDataset,
      model: selectedModel,
      experiment: selectedExperiment,
      quality: selectedQuality,
    });

    fetch(`http://localhost:4000/summary/get-summary?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics({
          totalDocuments: data.totalDocuments ?? 0,
          totalQAPairs: data.totalQAPairs ?? 0,
          verifiedQAPairs: data.verifiedQAPairs ?? 0,

          avgBiEncoder: data.avgBiEncoder ?? 0,
          avgCrossEncoder: data.avgCrossEncoder ?? 0,
          step1OnlyRate: data.step1OnlyRate ?? 0,

          validationRate: data.validationRate ?? 0,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch summary", err);
      });
  }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);

  // =========================
  // FILTER TABLE (LOCAL MOCK)
  // =========================
  const filteredQAPairs = useMemo(() => {
    return mockQAPairs.filter((qa) => {
      const matchesDataset =
        selectedDataset === "all" ||
        (selectedDataset === "vjol" && qa.language === "vi") ||
        (selectedDataset === "semantic_scholar" && qa.language === "en");

      const matchesModel =
        selectedModel === "all" || qa.model === selectedModel;

      const matchesSearch =
        searchQuery === "" ||
        qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.source_pdf.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDataset && matchesModel && matchesSearch;
    });
  }, [selectedDataset, selectedModel, searchQuery]);

  const handleViewSource = (qa: QAPair) => {
    setSelectedQA(qa);
    setIsSheetOpen(true);
  };

  // =========================
  // BUILD QUERY FOR SUMMARY
  // =========================
  function buildSummaryQuery({
    dataset,
    model,
    experiment,
    quality,
  }: {
    dataset: string;
    model: string;
    experiment: string;
    quality: string;
  }) {
    const params = new URLSearchParams();

    if (dataset !== "all") params.set("dataset", dataset);
    if (model !== "all") params.set("model", model);
    if (experiment !== "all") params.set("experiment", experiment);
    if (quality !== "all") params.set("quality", quality);

    return params.toString();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* SUMMARY CARDS */}
      <ReliabilitySummaryCards
        totalDocuments={metrics.totalDocuments}
        totalQAPairs={metrics.totalQAPairs}
        verifiedQAPairs={metrics.verifiedQAPairs}
        avgBiEncoder={metrics.avgBiEncoder}
        avgCrossEncoder={metrics.avgCrossEncoder}
        validationRate={metrics.validationRate}
        step1OnlyRate={metrics.step1OnlyRate}
      />

      <DatasetOverviewTable datasets={datasetOverview} />

      <QAPairValidationTable
        qaPairs={filteredQAPairs}
        totalQAPairs={metrics.totalQAPairs}
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
