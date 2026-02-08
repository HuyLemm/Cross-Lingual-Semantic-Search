import EmbeddingAnalysisHeader from './embedding-analysis/EmbeddingAnalysisHeader';
import EmbeddingDetailsTable from './embedding-analysis/EmbeddingDetailsTable';
import SimilarityAnalysisChart from './embedding-analysis/SimilarityAnalysisChart';
import PCAVisualization from './embedding-analysis/PCAVisualization';
import IntraCrossLingualCharts from './embedding-analysis/IntraCrossLingualCharts';
import EmbeddingQualityMetrics from './embedding-analysis/EmbeddingQualityMetrics';
import EmbeddingInsights from './embedding-analysis/EmbeddingInsights';
import { embeddingDetails, similarityData, pcaData, intraLingualData, crossLingualData } from './embedding-analysis/embeddingAnalysisData';

export default function EmbeddingAnalysis() {
  return (
    <div className="space-y-6">
      <EmbeddingAnalysisHeader />
      <EmbeddingDetailsTable embeddingDetails={embeddingDetails} />
      <SimilarityAnalysisChart similarityData={similarityData} />
      <PCAVisualization pcaData={pcaData} />
      <IntraCrossLingualCharts intraLingualData={intraLingualData} crossLingualData={crossLingualData} />
      <EmbeddingQualityMetrics embeddingDetails={embeddingDetails} />
      <EmbeddingInsights />
    </div>
  );
}