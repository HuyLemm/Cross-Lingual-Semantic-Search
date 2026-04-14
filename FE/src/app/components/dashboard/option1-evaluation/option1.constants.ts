export const MODEL_COLORS = {
  DeepSeek: "#3b82f6",
  Gemini: "#10b981",
  GPT: "#f59e0b",
} as const;

export type ModelName = keyof typeof MODEL_COLORS;