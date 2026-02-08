import RerankingHeader from './reranking-analysis/RerankingHeader';
import RerankingSummaryCards from './reranking-analysis/RerankingSummaryCards';
import RankChangesTable from './reranking-analysis/RankChangesTable';
import RerankingCharts from './reranking-analysis/RerankingCharts';
import LatencyBreakdown from './reranking-analysis/LatencyBreakdown';
import NegativeCases from './reranking-analysis/NegativeCases';
import RerankingInsights from './reranking-analysis/RerankingInsights';
import { rankChanges, metricsComparison, scoreImprovementData, latencyCostData, errorCases } from './reranking-analysis/rerankingAnalysisData';

export default function RerankingAnalysis() {
  return (
    <div className="space-y-6">
      <RerankingHeader />
      <RerankingSummaryCards />
      <RankChangesTable rankChanges={rankChanges} />
      <RerankingCharts metricsComparison={metricsComparison} scoreImprovementData={scoreImprovementData} />
      <LatencyBreakdown latencyCostData={latencyCostData} />
      <NegativeCases errorCases={errorCases} />
      <RerankingInsights />
    </div>
  );
}