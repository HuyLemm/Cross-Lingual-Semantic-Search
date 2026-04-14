export type LanguageCode = "en" | "vi" | "cross";
export type EmbedModel = "minilm" | "bge-m3";
export type VectorIndex = "flatip_cpu" | "flatip_cpu_72t";
export type RetrievalEngine = "faiss_cpu" | "faiss_cpu_72t";
export type RerankerMethod = "hybrid" | "bge-reranker-v2-m3";
export type RankingMethod = "heuristic" | "cross_encoder";

export type BackendResult = {
  title: string;
  text: string;
  raw_text?: string;
  file?: string;
  score: number;
};