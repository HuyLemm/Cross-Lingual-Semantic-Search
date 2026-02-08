export interface ExperimentConfig {
  embedding_model: string;
  embedding_dim: number;
  index_type: string;
  index_params: Record<string, number>;
  chunk_size: number;
  chunk_strategy: string;
  reranker: string;
  top_k: number;
  batch_size: number;
}

export interface Experiment {
  runId: string;
  timestamp: string;
  model: string;
  dataset: string;
  indexStrategy: string;
  recallK10: number;
  mrr: number;
  latency: number;
  status: 'Completed' | 'Failed';
  config: ExperimentConfig;
}

export const mockExperiments: Experiment[] = [
  {
    runId: 'EXP-001-20260118',
    timestamp: '2026-01-18 14:32:15',
    model: 'BGE-M3',
    dataset: 'arxiv-multilingual',
    indexStrategy: 'HNSW',
    recallK10: 0.91,
    mrr: 0.76,
    latency: 45,
    status: 'Completed',
    config: {
      embedding_model: 'BAAI/bge-m3',
      embedding_dim: 1024,
      index_type: 'HNSW',
      index_params: { M: 32, efConstruction: 200 },
      chunk_size: 512,
      chunk_strategy: 'sliding',
      reranker: 'cross-encoder',
      top_k: 10,
      batch_size: 32,
    },
  },
  {
    runId: 'EXP-002-20260118',
    timestamp: '2026-01-18 12:15:42',
    model: 'mE5-large',
    dataset: 'arxiv-multilingual',
    indexStrategy: 'IVF',
    recallK10: 0.88,
    mrr: 0.73,
    latency: 38,
    status: 'Completed',
    config: {
      embedding_model: 'intfloat/multilingual-e5-large',
      embedding_dim: 1024,
      index_type: 'IVF',
      index_params: { nlist: 100, nprobe: 10 },
      chunk_size: 512,
      chunk_strategy: 'fixed',
      reranker: 'none',
      top_k: 10,
      batch_size: 32,
    },
  },
  {
    runId: 'EXP-003-20260117',
    timestamp: '2026-01-17 18:45:23',
    model: 'LaBSE',
    dataset: 'wiki-qa',
    indexStrategy: 'Flat',
    recallK10: 0.85,
    mrr: 0.70,
    latency: 125,
    status: 'Completed',
    config: {
      embedding_model: 'sentence-transformers/LaBSE',
      embedding_dim: 768,
      index_type: 'Flat',
      index_params: {},
      chunk_size: 1024,
      chunk_strategy: 'semantic',
      reranker: 'none',
      top_k: 10,
      batch_size: 16,
    },
  },
  {
    runId: 'EXP-004-20260117',
    timestamp: '2026-01-17 15:22:10',
    model: 'BGE-M3',
    dataset: 'thesis-corpus',
    indexStrategy: 'HNSW',
    recallK10: 0.89,
    mrr: 0.74,
    latency: 42,
    status: 'Completed',
    config: {
      embedding_model: 'BAAI/bge-m3',
      embedding_dim: 1024,
      index_type: 'HNSW',
      index_params: { M: 16, efConstruction: 100 },
      chunk_size: 768,
      chunk_strategy: 'paragraph',
      reranker: 'bge-reranker',
      top_k: 20,
      batch_size: 32,
    },
  },
  {
    runId: 'EXP-005-20260116',
    timestamp: '2026-01-16 09:12:35',
    model: 'mUSE',
    dataset: 'arxiv-multilingual',
    indexStrategy: 'PQ',
    recallK10: 0.81,
    mrr: 0.65,
    latency: 28,
    status: 'Failed',
    config: {
      embedding_model: 'universal-sentence-encoder-multilingual',
      embedding_dim: 512,
      index_type: 'PQ',
      index_params: { m: 8, nbits: 8 },
      chunk_size: 512,
      chunk_strategy: 'fixed',
      reranker: 'none',
      top_k: 10,
      batch_size: 64,
    },
  },
];
