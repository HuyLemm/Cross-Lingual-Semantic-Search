export interface Model {
  name: string;
  type: string;
  multilingual: string;
  recallK: number;
  mrr: number;
  latency: number;
  memory: number;
}

export const models: Model[] = [
  {
    name: 'BGE-M3',
    type: 'Embedding',
    multilingual: 'Yes (100+ langs)',
    recallK: 0.91,
    mrr: 0.76,
    latency: 45,
    memory: 2.1,
  },
  {
    name: 'mE5-large',
    type: 'Embedding',
    multilingual: 'Yes (94 langs)',
    recallK: 0.88,
    mrr: 0.73,
    latency: 38,
    memory: 1.8,
  },
  {
    name: 'LaBSE',
    type: 'Embedding',
    multilingual: 'Yes (109 langs)',
    recallK: 0.85,
    mrr: 0.70,
    latency: 32,
    memory: 1.5,
  },
  {
    name: 'mUSE',
    type: 'Embedding',
    multilingual: 'Yes (16 langs)',
    recallK: 0.81,
    mrr: 0.65,
    latency: 28,
    memory: 1.2,
  },
  {
    name: 'Cross-Encoder',
    type: 'Reranker',
    multilingual: 'Limited',
    recallK: 0.95,
    mrr: 0.82,
    latency: 125,
    memory: 0.8,
  },
  {
    name: 'ColBERT',
    type: 'Hybrid',
    multilingual: 'No',
    recallK: 0.93,
    mrr: 0.79,
    latency: 78,
    memory: 3.4,
  },
];

export const radarData = [
  { metric: 'Recall', 'BGE-M3': 0.91, 'mE5-large': 0.88, 'LaBSE': 0.85, 'mUSE': 0.81 },
  { metric: 'MRR', 'BGE-M3': 0.76, 'mE5-large': 0.73, 'LaBSE': 0.70, 'mUSE': 0.65 },
  { metric: 'Speed', 'BGE-M3': 0.70, 'mE5-large': 0.78, 'LaBSE': 0.85, 'mUSE': 0.90 },
  { metric: 'Memory', 'BGE-M3': 0.65, 'mE5-large': 0.72, 'LaBSE': 0.80, 'mUSE': 0.88 },
  { metric: 'Multilingual', 'BGE-M3': 0.95, 'mE5-large': 0.92, 'LaBSE': 0.98, 'mUSE': 0.60 },
];

export const tradeoffData = [
  { model: 'BGE-M3', speed: 45, accuracy: 91, size: 2100 },
  { model: 'mE5-large', speed: 38, accuracy: 88, size: 1800 },
  { model: 'LaBSE', speed: 32, accuracy: 85, size: 1500 },
  { model: 'mUSE', speed: 28, accuracy: 81, size: 1200 },
  { model: 'Cross-Encoder', speed: 125, accuracy: 95, size: 800 },
  { model: 'ColBERT', speed: 78, accuracy: 93, size: 3400 },
];
