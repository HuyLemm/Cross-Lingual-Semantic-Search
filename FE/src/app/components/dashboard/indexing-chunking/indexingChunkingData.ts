export interface IndexingStrategy {
  name: string;
  buildTime: number;
  queryLatency: number;
  recall: number;
  memory: number;
}

export interface ChunkingStrategy {
  name: string;
  avgChunks: number;
  recall: number;
  overlap: number;
  coherence: number;
}

export interface ChunkSizeAccuracy {
  size: number;
  recall: number;
  precision: number;
  f1: number;
}

export const indexingStrategies: IndexingStrategy[] = [
  { name: 'Flat', buildTime: 45, queryLatency: 125, recall: 1.00, memory: 2.4 },
  { name: 'IVF (nlist=100)', buildTime: 23, queryLatency: 8.2, recall: 0.96, memory: 1.2 },
  { name: 'HNSW (M=32)', buildTime: 68, queryLatency: 3.5, recall: 0.98, memory: 3.1 },
  { name: 'PQ (m=8)', buildTime: 34, queryLatency: 12.5, recall: 0.89, memory: 0.6 },
  { name: 'IVF+PQ', buildTime: 28, queryLatency: 9.8, recall: 0.93, memory: 0.8 },
];

export const chunkingStrategies: ChunkingStrategy[] = [
  { name: 'Fixed 512', avgChunks: 48320, recall: 0.85, overlap: 0, coherence: 0.72 },
  { name: 'Fixed 1024', avgChunks: 24160, recall: 0.88, overlap: 0, coherence: 0.78 },
  { name: 'Sliding 512/128', avgChunks: 62840, recall: 0.91, overlap: 0.25, coherence: 0.81 },
  { name: 'Semantic', avgChunks: 36240, recall: 0.93, overlap: 0, coherence: 0.92 },
  { name: 'Paragraph', avgChunks: 41280, recall: 0.87, overlap: 0, coherence: 0.88 },
];

export const chunkSizeAccuracyData: ChunkSizeAccuracy[] = [
  { size: 128, recall: 0.76, precision: 0.82, f1: 0.79 },
  { size: 256, recall: 0.81, precision: 0.85, f1: 0.83 },
  { size: 512, recall: 0.85, precision: 0.88, f1: 0.865 },
  { size: 1024, recall: 0.88, precision: 0.86, f1: 0.87 },
  { size: 2048, recall: 0.86, precision: 0.81, f1: 0.835 },
];

export const buildTimeComparisonData = indexingStrategies.map(s => ({
  strategy: s.name.split(' ')[0],
  time: s.buildTime
}));

export const queryLatencyComparisonData = indexingStrategies.map(s => ({
  strategy: s.name.split(' ')[0],
  latency: s.queryLatency
}));
