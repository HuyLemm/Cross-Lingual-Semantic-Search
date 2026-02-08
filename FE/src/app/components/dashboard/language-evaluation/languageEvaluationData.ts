import { LanguageMetrics } from './LanguageStatisticsTable';

export interface CrossLingualMetrics {
  pair: string;
  sourceLanguage: string;
  targetLanguage: string;
  avgSimilarity: number;
  retrievalAccuracy: number;
  model: string;
}

// Comprehensive language metrics data
export const allLanguageMetrics: LanguageMetrics[] = [
  {
    language: 'EN',
    recall: 0.91,
    precision: 0.88,
    f1: 0.895,
    avgSimilarity: 0.89,
    qaCount: 1523,
    successRate: 0.91,
    falsePositiveRate: 0.08,
    falseNegativeRate: 0.05,
    avgLatency: 38,
    model: 'GPT-5.2'
  },
  {
    language: 'VI',
    recall: 0.85,
    precision: 0.82,
    f1: 0.835,
    avgSimilarity: 0.84,
    qaCount: 745,
    successRate: 0.85,
    falsePositiveRate: 0.12,
    falseNegativeRate: 0.09,
    avgLatency: 42,
    model: 'GPT-5.2'
  },
  {
    language: 'ZH',
    recall: 0.83,
    precision: 0.80,
    f1: 0.815,
    avgSimilarity: 0.81,
    qaCount: 592,
    successRate: 0.83,
    falsePositiveRate: 0.14,
    falseNegativeRate: 0.11,
    avgLatency: 45,
    model: 'GPT-5.2'
  },
  {
    language: 'EN',
    recall: 0.89,
    precision: 0.86,
    f1: 0.875,
    avgSimilarity: 0.87,
    qaCount: 1480,
    successRate: 0.89,
    falsePositiveRate: 0.09,
    falseNegativeRate: 0.06,
    avgLatency: 41,
    model: 'Gemini 2.5 Flash'
  },
  {
    language: 'VI',
    recall: 0.83,
    precision: 0.80,
    f1: 0.815,
    avgSimilarity: 0.82,
    qaCount: 720,
    successRate: 0.83,
    falsePositiveRate: 0.13,
    falseNegativeRate: 0.10,
    avgLatency: 44,
    model: 'Gemini 2.5 Flash'
  },
  {
    language: 'ZH',
    recall: 0.81,
    precision: 0.78,
    f1: 0.795,
    avgSimilarity: 0.79,
    qaCount: 580,
    successRate: 0.81,
    falsePositiveRate: 0.15,
    falseNegativeRate: 0.12,
    avgLatency: 47,
    model: 'Gemini 2.5 Flash'
  },
  {
    language: 'EN',
    recall: 0.88,
    precision: 0.85,
    f1: 0.865,
    avgSimilarity: 0.86,
    qaCount: 1450,
    successRate: 0.88,
    falsePositiveRate: 0.10,
    falseNegativeRate: 0.07,
    avgLatency: 39,
    model: 'DeepSeek R1T2'
  },
  {
    language: 'VI',
    recall: 0.86,
    precision: 0.83,
    f1: 0.845,
    avgSimilarity: 0.85,
    qaCount: 730,
    successRate: 0.86,
    falsePositiveRate: 0.11,
    falseNegativeRate: 0.08,
    avgLatency: 40,
    model: 'DeepSeek R1T2'
  },
  {
    language: 'ZH',
    recall: 0.84,
    precision: 0.81,
    f1: 0.825,
    avgSimilarity: 0.82,
    qaCount: 600,
    successRate: 0.84,
    falsePositiveRate: 0.13,
    falseNegativeRate: 0.10,
    avgLatency: 43,
    model: 'DeepSeek R1T2'
  },
];

// Cross-lingual performance metrics
export const allCrossLingualMetrics: CrossLingualMetrics[] = [
  { pair: 'EN → VI', sourceLanguage: 'EN', targetLanguage: 'VI', avgSimilarity: 0.78, retrievalAccuracy: 0.82, model: 'GPT-5.2' },
  { pair: 'VI → EN', sourceLanguage: 'VI', targetLanguage: 'EN', avgSimilarity: 0.76, retrievalAccuracy: 0.80, model: 'GPT-5.2' },
  { pair: 'EN → ZH', sourceLanguage: 'EN', targetLanguage: 'ZH', avgSimilarity: 0.72, retrievalAccuracy: 0.75, model: 'GPT-5.2' },
  { pair: 'ZH → EN', sourceLanguage: 'ZH', targetLanguage: 'EN', avgSimilarity: 0.71, retrievalAccuracy: 0.74, model: 'GPT-5.2' },
  { pair: 'VI → ZH', sourceLanguage: 'VI', targetLanguage: 'ZH', avgSimilarity: 0.68, retrievalAccuracy: 0.70, model: 'GPT-5.2' },
  { pair: 'ZH → VI', sourceLanguage: 'ZH', targetLanguage: 'VI', avgSimilarity: 0.67, retrievalAccuracy: 0.69, model: 'GPT-5.2' },
  { pair: 'EN → VI', sourceLanguage: 'EN', targetLanguage: 'VI', avgSimilarity: 0.76, retrievalAccuracy: 0.80, model: 'Gemini 2.5 Flash' },
  { pair: 'VI → EN', sourceLanguage: 'VI', targetLanguage: 'EN', avgSimilarity: 0.74, retrievalAccuracy: 0.78, model: 'Gemini 2.5 Flash' },
  { pair: 'EN → ZH', sourceLanguage: 'EN', targetLanguage: 'ZH', avgSimilarity: 0.70, retrievalAccuracy: 0.73, model: 'Gemini 2.5 Flash' },
  { pair: 'ZH → EN', sourceLanguage: 'ZH', targetLanguage: 'EN', avgSimilarity: 0.69, retrievalAccuracy: 0.72, model: 'Gemini 2.5 Flash' },
  { pair: 'VI → ZH', sourceLanguage: 'VI', targetLanguage: 'ZH', avgSimilarity: 0.66, retrievalAccuracy: 0.68, model: 'Gemini 2.5 Flash' },
  { pair: 'ZH → VI', sourceLanguage: 'ZH', targetLanguage: 'VI', avgSimilarity: 0.65, retrievalAccuracy: 0.67, model: 'Gemini 2.5 Flash' },
  { pair: 'EN → VI', sourceLanguage: 'EN', targetLanguage: 'VI', avgSimilarity: 0.79, retrievalAccuracy: 0.83, model: 'DeepSeek R1T2' },
  { pair: 'VI → EN', sourceLanguage: 'VI', targetLanguage: 'EN', avgSimilarity: 0.77, retrievalAccuracy: 0.81, model: 'DeepSeek R1T2' },
  { pair: 'EN → ZH', sourceLanguage: 'EN', targetLanguage: 'ZH', avgSimilarity: 0.73, retrievalAccuracy: 0.76, model: 'DeepSeek R1T2' },
  { pair: 'ZH → EN', sourceLanguage: 'ZH', targetLanguage: 'EN', avgSimilarity: 0.72, retrievalAccuracy: 0.75, model: 'DeepSeek R1T2' },
  { pair: 'VI → ZH', sourceLanguage: 'VI', targetLanguage: 'ZH', avgSimilarity: 0.69, retrievalAccuracy: 0.71, model: 'DeepSeek R1T2' },
  { pair: 'ZH → VI', sourceLanguage: 'ZH', targetLanguage: 'VI', avgSimilarity: 0.68, retrievalAccuracy: 0.70, model: 'DeepSeek R1T2' },
];
