export type ModelId = "gpt-5.2" | "gemini-2.5" | "deepseek-r1t2";

export type ModelSectionPayload = {
  modelId: ModelId | string;
  name: string;
  verification: string;

  metrics: {
    total: number;
    passedSimilarity: number;
    passedEntailment: number;
    verified: number;
  };

  chartData: { language: "EN" | "VI" | string; similarity: number; entailment: number; verifiedRatio: number }[];

  pieData: { name: string; value: number; color: string }[];

  thresholdData: { threshold: number; verified: number; similarity: number; entailment: number }[];

  errorDistribution: { language: "EN" | "VI" | string; verified: number; simFail: number; entFail: number; bothFail: number }[];

  tableData: {
    language: "EN" | "VI" | string;
    qaCount: number;
    avgSimilarity: number;
    avgEntailment: number;
    verified: number;
    step1Only: number;
    failed: number;
  }[];

  qualityThreshold?: number;
  dataset?: string;
  experiment?: string;
};