import { useState, useMemo } from 'react';
import LanguageEvaluationHeader from './language-evaluation/LanguageEvaluationHeader';
import LanguageMetricsChart from './language-evaluation/LanguageMetricsChart';
import CrossLingualCharts from './language-evaluation/CrossLingualCharts';
import ErrorAnalysisChart from './language-evaluation/ErrorAnalysisChart';
import LanguageStatisticsTable from './language-evaluation/LanguageStatisticsTable';
import LanguageInsightCards from './language-evaluation/LanguageInsightCards';
import { allLanguageMetrics, allCrossLingualMetrics } from './language-evaluation/languageEvaluationData';
import type { LanguageMetrics } from './language-evaluation/LanguageStatisticsTable';

export default function LanguageEvaluation() {
  const [sourceLanguage, setSourceLanguage] = useState('EN');
  const [targetLanguage, setTargetLanguage] = useState('VI');
  const [selectedModel, setSelectedModel] = useState('all');

  // Filter data based on selected model
  const filteredLanguageMetrics = useMemo(() => 
    selectedModel === 'all' 
      ? allLanguageMetrics 
      : allLanguageMetrics.filter(m => m.model === selectedModel),
    [selectedModel]
  );

  const filteredCrossLingualMetrics = useMemo(() =>
    selectedModel === 'all'
      ? allCrossLingualMetrics
      : allCrossLingualMetrics.filter(m => m.model === selectedModel),
    [selectedModel]
  );

  // Aggregate metrics by language for charts (average across models if "all" is selected)
  const aggregateByLanguage = (metrics: LanguageMetrics[]) => {
    const languageGroups = metrics.reduce((acc, metric) => {
      if (!acc[metric.language]) {
        acc[metric.language] = [];
      }
      acc[metric.language].push(metric);
      return acc;
    }, {} as Record<string, LanguageMetrics[]>);

    return Object.entries(languageGroups).map(([language, data]) => ({
      language,
      recall: data.reduce((sum, m) => sum + m.recall, 0) / data.length,
      precision: data.reduce((sum, m) => sum + m.precision, 0) / data.length,
      f1: data.reduce((sum, m) => sum + m.f1, 0) / data.length,
      avgSimilarity: data.reduce((sum, m) => sum + m.avgSimilarity, 0) / data.length,
    }));
  };

  const languageChartData = useMemo(() => 
    aggregateByLanguage(filteredLanguageMetrics),
    [filteredLanguageMetrics]
  );

  // Error analysis data
  const errorAnalysisData = useMemo(() => 
    aggregateByLanguage(filteredLanguageMetrics).map(lang => {
      const metrics = filteredLanguageMetrics.filter(m => m.language === lang.language);
      const avgFP = metrics.reduce((sum, m) => sum + m.falsePositiveRate, 0) / metrics.length;
      const avgFN = metrics.reduce((sum, m) => sum + m.falseNegativeRate, 0) / metrics.length;
      
      return {
        language: lang.language,
        falsePositive: avgFP,
        falseNegative: avgFN,
      };
    }),
    [filteredLanguageMetrics]
  );

  // Calculate insights
  const insights = useMemo(() => {
    // Best performing language
    const bestLang = [...filteredLanguageMetrics].sort((a, b) => b.successRate - a.successRate)[0];
    
    // Most reliable cross-lingual pair
    const bestCrossLingual = [...filteredCrossLingualMetrics].sort((a, b) => b.retrievalAccuracy - a.retrievalAccuracy)[0];
    
    // Most challenging pair
    const worstCrossLingual = [...filteredCrossLingualMetrics].sort((a, b) => a.retrievalAccuracy - b.retrievalAccuracy)[0];
    
    // Most stable model across languages
    const modelStability = ['GPT-5.2', 'Gemini 2.5 Flash', 'DeepSeek R1T2'].map(model => {
      const modelMetrics = allLanguageMetrics.filter(m => m.model === model);
      const avgScore = modelMetrics.reduce((sum, m) => sum + m.successRate, 0) / modelMetrics.length;
      const variance = modelMetrics.reduce((sum, m) => sum + Math.pow(m.successRate - avgScore, 2), 0) / modelMetrics.length;
      const stdDev = Math.sqrt(variance);
      
      return { model, avgScore, stdDev };
    });
    
    const mostStable = modelStability.sort((a, b) => a.stdDev - b.stdDev)[0];
    
    return { bestLang, bestCrossLingual, worstCrossLingual, mostStable };
  }, [filteredLanguageMetrics, filteredCrossLingualMetrics]);

  return (
    <div className="p-6 space-y-6">
      {/* Header with controls */}
      <LanguageEvaluationHeader
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        selectedModel={selectedModel}
        onSourceLanguageChange={setSourceLanguage}
        onTargetLanguageChange={setTargetLanguage}
        onModelChange={setSelectedModel}
      />

      {/* Main metrics chart */}
      <LanguageMetricsChart data={languageChartData} />

      {/* Cross-lingual performance charts */}
      <CrossLingualCharts data={filteredCrossLingualMetrics} />

      {/* Error analysis chart */}
      <ErrorAnalysisChart data={errorAnalysisData} />

      {/* Statistics table */}
      <LanguageStatisticsTable data={filteredLanguageMetrics} />

      {/* Insight summary cards */}
      <LanguageInsightCards insights={insights} />
    </div>
  );
}
