export type QueryStatus = "success" | "partial" | "failed";

export type QueryRow = {
  id: string;
  query: string;
  type: string;
  language: "EN" | "VI";
  engine?: string;

  topDoc: string;
  similarity: number;
  rank: number;
  recall10: number;
  mrr: number;
  status: QueryStatus;

  // new raw fields
  latency_ms?: number;
  expected_context?: string;
  usecase?: string;
  num_results?: number;
  top1_score?: number;
  top1_title?: string;
  top1_source_file?: string;
  top_candidates?: Array<{
    rank?: number;
    score?: number;
    faiss_score?: number;
    source_file?: string;
    title?: string;
    snippet?: string;
  }>;

  [key: string]: any;
};

export type FailedQueryRow = {
  query: string;
  type: string;
  language: "EN" | "VI";
  expected: string;
  rank: number;
  similarity: number;
  errorType:
    | "Keyword bias"
    | "Semantic mismatch"
    | "Translation issue"
    | "Embedding limitation"
    | "Chunking problem";
};