export interface ErrorCategory {
  category: string;
  count: number;
  percentage: number;
  severity: 'High' | 'Medium' | 'Low';
}

export interface ErrorByModel {
  model: string;
  wrongLang: number;
  semantic: number;
  partial: number;
  keyword: number;
  ranking: number;
}

export interface ErrorExample {
  id: string;
  category: string;
  query: string;
  queryLang: string;
  retrieved: string;
  retrievedLang: string;
  expectedLang: string;
  model: string;
  description: string;
}

export const errorCategories: ErrorCategory[] = [
  { category: 'Wrong Language Match', count: 89, percentage: 12.3, severity: 'High' },
  { category: 'Semantic Mismatch', count: 156, percentage: 21.5, severity: 'Medium' },
  { category: 'Partial Context', count: 234, percentage: 32.2, severity: 'Medium' },
  { category: 'Keyword Bias', count: 178, percentage: 24.5, severity: 'Low' },
  { category: 'Ranking Error', count: 69, percentage: 9.5, severity: 'Low' },
];

export const errorByModelData: ErrorByModel[] = [
  { model: 'BGE-M3', wrongLang: 12, semantic: 18, partial: 24, keyword: 21, ranking: 8 },
  { model: 'mE5-large', wrongLang: 15, semantic: 22, partial: 28, keyword: 25, ranking: 10 },
  { model: 'LaBSE', wrongLang: 10, semantic: 26, partial: 31, keyword: 28, ranking: 12 },
  { model: 'mUSE', wrongLang: 18, semantic: 34, partial: 38, keyword: 32, ranking: 14 },
];

export const errorExamples: ErrorExample[] = [
  {
    id: 'ERR001',
    category: 'Wrong Language Match',
    query: 'How does attention mechanism work?',
    queryLang: 'EN',
    retrieved: 'Les mécanismes d\'attention permettent aux modèles...',
    retrievedLang: 'FR',
    expectedLang: 'EN',
    model: 'mUSE',
    description: 'Model retrieved French document instead of English despite query being in English',
  },
  {
    id: 'ERR002',
    category: 'Semantic Mismatch',
    query: 'What is vector quantization?',
    queryLang: 'EN',
    retrieved: 'Scalar quantization reduces precision by mapping continuous values...',
    retrievedLang: 'EN',
    expectedLang: 'EN',
    model: 'LaBSE',
    description: 'Retrieved information about scalar quantization instead of vector quantization',
  },
  {
    id: 'ERR003',
    category: 'Partial Context',
    query: 'Transformer architecture components',
    queryLang: 'EN',
    retrieved: '...and the feedforward network processes each position independently...',
    retrievedLang: 'EN',
    expectedLang: 'EN',
    model: 'BGE-M3',
    description: 'Retrieved chunk missing beginning context about attention layers',
  },
  {
    id: 'ERR004',
    category: 'Keyword Bias',
    query: 'Deep learning optimization techniques',
    queryLang: 'EN',
    retrieved: 'The deep learning community has developed various optimization algorithms...',
    retrievedLang: 'EN',
    expectedLang: 'EN',
    model: 'mE5-large',
    description: 'Retrieved generic introduction due to keyword match rather than specific techniques',
  },
];
