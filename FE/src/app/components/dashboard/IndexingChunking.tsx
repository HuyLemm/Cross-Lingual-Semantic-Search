import IndexingChunkingHeader from './indexing-chunking/IndexingChunkingHeader';
import IndexingStrategyTable from './indexing-chunking/IndexingStrategyTable';
import ChunkingStrategyTable from './indexing-chunking/ChunkingStrategyTable';
import IndexingCharts from './indexing-chunking/IndexingCharts';
import ChunkingCharts from './indexing-chunking/ChunkingCharts';
import StrategyRecommendations from './indexing-chunking/StrategyRecommendations';
import { 
  indexingStrategies, 
  chunkingStrategies, 
  chunkSizeAccuracyData,
  buildTimeComparisonData,
  queryLatencyComparisonData
} from './indexing-chunking/indexingChunkingData';

export default function IndexingChunking() {
  return (
    <div className="space-y-6">
      <IndexingChunkingHeader />
      <IndexingStrategyTable strategies={indexingStrategies} />
      <ChunkingStrategyTable strategies={chunkingStrategies} />
      <IndexingCharts 
        buildTimeData={buildTimeComparisonData}
        queryLatencyData={queryLatencyComparisonData}
      />
      <ChunkingCharts 
        chunkSizeData={chunkSizeAccuracyData}
        indexingStrategies={indexingStrategies}
      />
      <StrategyRecommendations />
    </div>
  );
}
