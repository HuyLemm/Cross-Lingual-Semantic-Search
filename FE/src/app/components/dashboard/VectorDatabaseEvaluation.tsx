import VectorDatabaseHeader from './vector-database/VectorDatabaseHeader';
import DatabaseSummaryCards from './vector-database/DatabaseSummaryCards';
import DatabaseComparisonTable from './vector-database/DatabaseComparisonTable';
import InsertSpeedChart from './vector-database/InsertSpeedChart';
import SearchLatencyChart from './vector-database/SearchLatencyChart';
import RecallComparisonChart from './vector-database/RecallComparisonChart';
import StorageCostChart from './vector-database/StorageCostChart';
import ScalabilityChart from './vector-database/ScalabilityChart';
import FeatureMatrixTable from './vector-database/FeatureMatrixTable';
import DatabaseRecommendations from './vector-database/DatabaseRecommendations';
import {
  databases,
  insertSpeedData,
  searchLatencyData,
  recallComparisonData,
  storageCostData,
  scalabilityData,
} from './vector-database/vectorDatabaseData';

export default function VectorDatabaseEvaluation() {
  return (
    <div className="space-y-6">
      <VectorDatabaseHeader />
      
      <DatabaseSummaryCards />
      
      <DatabaseComparisonTable databases={databases} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsertSpeedChart data={insertSpeedData} />
        <SearchLatencyChart data={searchLatencyData} />
        <RecallComparisonChart data={recallComparisonData} />
        <StorageCostChart data={storageCostData} />
      </div>
      
      <ScalabilityChart data={scalabilityData} />
      
      <FeatureMatrixTable />
      
      <DatabaseRecommendations />
    </div>
  );
}
