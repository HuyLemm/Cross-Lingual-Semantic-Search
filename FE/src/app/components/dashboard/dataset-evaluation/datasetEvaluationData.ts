// Dataset-level metrics (NOT model runtime evaluation)

export interface DatasetMetrics {
  language: string;          // EN / VI
  model: string;             // GPT-5.2 / Gemini / DeepSeek
  verification: string;      // bi / cross / both
  qaCount: number;           // total QA
  avgSimilarity: number;     // bi-encoder similarity
  avgEntailment: number;     // cross-encoder score
  verifiedRatio: number;     // % QA passed verification
  avgQAperDoc: number;       // QA / PDF
}

