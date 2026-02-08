export const topKAccuracyData = [
  { model: 'BGE-M3', k1: 0.65, k5: 0.82, k10: 0.91 },
  { model: 'mE5-large', k1: 0.62, k5: 0.79, k10: 0.88 },
  { model: 'LaBSE', k1: 0.58, k5: 0.76, k10: 0.85 },
  { model: 'mUSE', k1: 0.54, k5: 0.71, k10: 0.81 },
];

export const metricsOverTimeData = [
  { k: 1, mrr: 0.65, recall: 0.65, precision: 0.92 },
  { k: 3, mrr: 0.71, recall: 0.73, precision: 0.87 },
  { k: 5, mrr: 0.74, recall: 0.82, precision: 0.81 },
  { k: 10, mrr: 0.76, recall: 0.91, precision: 0.74 },
  { k: 20, mrr: 0.77, recall: 0.95, precision: 0.68 },
];

export const latencyAccuracyData = [
  { model: 'BGE-M3', latency: 45, accuracy: 91 },
  { model: 'mE5-large', latency: 38, accuracy: 88 },
  { model: 'LaBSE', latency: 32, accuracy: 85 },
  { model: 'mUSE', latency: 28, accuracy: 81 },
  { model: 'SBERT', latency: 25, accuracy: 78 },
];

export const memoryUsageData = [
  { index: 'FAISS-Flat', memory: 2.4 },
  { index: 'FAISS-IVF', memory: 1.2 },
  { index: 'HNSW', memory: 3.1 },
  { index: 'PQ', memory: 0.6 },
];
