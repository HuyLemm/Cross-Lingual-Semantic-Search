// Types and interfaces
export interface Database {
  name: string;
  insertSpeed: number;
  searchLatency: number;
  recallK: number;
  storageCost: number;
  features: string[];
}

export interface ChartDataPoint {
  db: string;
  speed?: number;
  latency?: number;
  cost?: number;
}

export interface RecallDataPoint {
  k: number;
  FAISS: number;
  Milvus: number;
  Qdrant: number;
  Weaviate: number;
}

export interface ScalabilityDataPoint {
  vectors: string;
  FAISS: number;
  Milvus: number;
  Qdrant: number;
  Weaviate: number;
}

// Mock data
export const databases: Database[] = [
  {
    name: 'FAISS',
    insertSpeed: 12450,
    searchLatency: 8.2,
    recallK: 0.96,
    storageCost: 2.4,
    features: ['CPU optimized', 'Multiple index types', 'In-memory'],
  },
  {
    name: 'Milvus',
    insertSpeed: 9820,
    searchLatency: 12.5,
    recallK: 0.97,
    storageCost: 3.1,
    features: ['Distributed', 'GPU support', 'Scalable'],
  },
  {
    name: 'Qdrant',
    insertSpeed: 10200,
    searchLatency: 10.8,
    recallK: 0.96,
    storageCost: 2.8,
    features: ['Rust-based', 'Filtering', 'Cloud-native'],
  },
  {
    name: 'Weaviate',
    insertSpeed: 8750,
    searchLatency: 15.2,
    recallK: 0.95,
    storageCost: 3.4,
    features: ['GraphQL API', 'Hybrid search', 'ML models'],
  },
];

export const insertSpeedData: ChartDataPoint[] = [
  { db: 'FAISS', speed: 12450 },
  { db: 'Qdrant', speed: 10200 },
  { db: 'Milvus', speed: 9820 },
  { db: 'Weaviate', speed: 8750 },
];

export const searchLatencyData: ChartDataPoint[] = [
  { db: 'FAISS', latency: 8.2 },
  { db: 'Qdrant', latency: 10.8 },
  { db: 'Milvus', latency: 12.5 },
  { db: 'Weaviate', latency: 15.2 },
];

export const recallComparisonData: RecallDataPoint[] = [
  { k: 1, FAISS: 0.65, Milvus: 0.67, Qdrant: 0.65, Weaviate: 0.63 },
  { k: 5, FAISS: 0.82, Milvus: 0.84, Qdrant: 0.82, Weaviate: 0.80 },
  { k: 10, FAISS: 0.91, Milvus: 0.93, Qdrant: 0.91, Weaviate: 0.89 },
  { k: 20, FAISS: 0.96, Milvus: 0.97, Qdrant: 0.96, Weaviate: 0.95 },
  { k: 50, FAISS: 0.99, Milvus: 0.99, Qdrant: 0.99, Weaviate: 0.98 },
];

export const storageCostData: ChartDataPoint[] = [
  { db: 'FAISS', cost: 2.4 },
  { db: 'Qdrant', cost: 2.8 },
  { db: 'Milvus', cost: 3.1 },
  { db: 'Weaviate', cost: 3.4 },
];

export const scalabilityData: ScalabilityDataPoint[] = [
  { vectors: '100K', FAISS: 8.2, Milvus: 12.5, Qdrant: 10.8, Weaviate: 15.2 },
  { vectors: '1M', FAISS: 9.1, Milvus: 14.2, Qdrant: 12.1, Weaviate: 17.8 },
  { vectors: '10M', FAISS: 12.5, Milvus: 18.5, Qdrant: 15.2, Weaviate: 24.3 },
  { vectors: '50M', FAISS: 18.2, Milvus: 25.1, Qdrant: 21.5, Weaviate: 35.6 },
];
