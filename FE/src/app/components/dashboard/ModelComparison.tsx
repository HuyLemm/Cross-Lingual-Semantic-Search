import ModelComparisonTable from './model-comparison/ModelComparisonTable';
import ModelCharts from './model-comparison/ModelCharts';
import ModelRecommendations from './model-comparison/ModelRecommendations';
import { models, radarData, tradeoffData } from './model-comparison/modelComparisonData';

export default function ModelComparison() {
  return (
    <div className="space-y-6">
      <ModelComparisonTable models={models} />
      <ModelCharts radarData={radarData} tradeoffData={tradeoffData} />
      <ModelRecommendations />
    </div>
  );
}
