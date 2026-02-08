export const rankChanges = [
  { queryId: 'Q001', beforeRank: 3, afterRank: 1, scoreBefore: 0.72, scoreAfter: 0.89, change: 'up' },
  { queryId: 'Q002', beforeRank: 1, afterRank: 1, scoreBefore: 0.91, scoreAfter: 0.94, change: 'same' },
  { queryId: 'Q003', beforeRank: 5, afterRank: 2, scoreBefore: 0.68, scoreAfter: 0.86, change: 'up' },
  { queryId: 'Q004', beforeRank: 2, afterRank: 1, scoreBefore: 0.81, scoreAfter: 0.92, change: 'up' },
  { queryId: 'Q005', beforeRank: 1, afterRank: 3, scoreBefore: 0.88, scoreAfter: 0.79, change: 'down' },
  { queryId: 'Q006', beforeRank: 4, afterRank: 2, scoreBefore: 0.70, scoreAfter: 0.84, change: 'up' },
];

export const metricsComparison = [
  { metric: 'Recall@1', before: 0.65, after: 0.78, gain: 0.13 },
  { metric: 'Recall@3', before: 0.73, after: 0.85, gain: 0.12 },
  { metric: 'Recall@5', before: 0.82, after: 0.91, gain: 0.09 },
  { metric: 'Recall@10', before: 0.91, after: 0.95, gain: 0.04 },
  { metric: 'MRR', before: 0.71, after: 0.82, gain: 0.11 },
  { metric: 'Precision@5', before: 0.68, after: 0.79, gain: 0.11 },
];

export const scoreImprovementData = [
  { position: 1, before: 0.85, after: 0.92 },
  { position: 2, before: 0.79, after: 0.87 },
  { position: 3, before: 0.74, after: 0.83 },
  { position: 4, before: 0.70, after: 0.79 },
  { position: 5, before: 0.67, after: 0.76 },
  { position: 10, before: 0.58, after: 0.68 },
];

export const latencyCostData = [
  { stage: 'Embedding', latency: 42, cumulative: 42 },
  { stage: 'Initial Retrieval', latency: 8, cumulative: 50 },
  { stage: 'Reranking', latency: 78, cumulative: 128 },
];

export const errorCases = [
  {
    queryId: 'Q005',
    query: 'What is gradient descent optimization?',
    issue: 'Reranker preferred keyword match over semantic relevance',
    impact: 'Rank dropped from #1 to #3',
    severity: 'Medium',
  },
  {
    queryId: 'Q012',
    query: 'Cross-lingual embedding alignment',
    issue: 'Reranker not trained on multilingual data',
    impact: 'Rank dropped from #2 to #5',
    severity: 'High',
  },
];
