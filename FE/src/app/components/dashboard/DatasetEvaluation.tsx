import { useState, useMemo, useEffect } from "react";
import DatasetEvaluationHeader from "./dataset-evaluation/DatasetEvaluationHeader";
import DatasetMetricsChart from "./dataset-evaluation/DatasetMetricsChart";
import DatasetStatisticsTable from "./dataset-evaluation/DatasetStatisticsTable";
import DatasetInsightCards from "./dataset-evaluation/DatasetInsightCards";

export interface DatasetMetrics {
  language: string;
  model: string;
  verification: string;
  qaCount: number;
  avgSimilarity: number;
  avgEntailment: number;
  verifiedRatio: number;
}

export default function DatasetEvaluation() {
  const [language, setLanguage] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [verification, setVerification] = useState("both");

  const [metrics, setMetrics] = useState<DatasetMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
   * FETCH BACKEND METRICS
   * ========================================================= */
  useEffect(() => {
    setLoading(true);

    fetch(
      `http://localhost:4000/dataset-eval/metrics?language=${language}&model=${selectedModel}&verification=${verification}`
    )
      .then((r) => r.json())
      .then((d) => {
        setMetrics(d.items || []);
      })
      .catch((err) => {
        console.error("Failed to load dataset metrics", err);
        setMetrics([]);
      })
      .finally(() => setLoading(false));
  }, [language, selectedModel, verification]);

  /* =========================================================
   * CHART DATA (aggregate by language)
   * ========================================================= */
  const chartData = useMemo(() => {
    const groups: Record<string, DatasetMetrics[]> = {};

    metrics.forEach((m) => {
      if (!groups[m.language]) groups[m.language] = [];
      groups[m.language].push(m);
    });

    return Object.entries(groups).map(([lang, data]) => ({
      language: lang,
      avgSimilarity:
        data.reduce((s, d) => s + d.avgSimilarity, 0) / data.length,
      avgEntailment:
        data.reduce((s, d) => s + d.avgEntailment, 0) / data.length,
      verifiedRatio:
        data.reduce((s, d) => s + d.verifiedRatio, 0) / data.length,
    }));
  }, [metrics]);

  /* =========================================================
   * INSIGHTS
   * ========================================================= */
  const insights = useMemo(() => {
    if (!metrics.length) return null;

    const bestLanguage = [...metrics].sort(
      (a, b) => b.verifiedRatio - a.verifiedRatio
    )[0];

    const highestSimilarity = [...metrics].sort(
      (a, b) => b.avgSimilarity - a.avgSimilarity
    )[0];

    const strongestEntailment = [...metrics].sort(
      (a, b) => b.avgEntailment - a.avgEntailment
    )[0];

    return {
      bestLanguage,
      highestSimilarity,
      strongestEntailment,
    };
  }, [metrics]);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <DatasetEvaluationHeader
        language={language}
        selectedModel={selectedModel}
        verification={verification}
        onLanguageChange={setLanguage}
        onModelChange={setSelectedModel}
        onVerificationChange={setVerification}
      />

      {loading ? (
        <div className="text-sm text-gray-500">Loading dataset metrics...</div>
      ) : (
        <>
          {/* Chart */}
          <DatasetMetricsChart data={chartData} />

          {/* Table */}
          <DatasetStatisticsTable data={metrics} />

          {/* Insight */}
          {insights && <DatasetInsightCards insights={insights} />}
        </>
      )}
    </div>
  );
}
