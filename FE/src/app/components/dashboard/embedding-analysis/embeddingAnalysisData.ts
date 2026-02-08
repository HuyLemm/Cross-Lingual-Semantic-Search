export const embeddingDetails = [
  { model: 'BGE-M3', dimension: 1024, corpus: 'Wikipedia + C4', languages: '100+', avgSimilarity: 0.78 },
  { model: 'mE5-large', dimension: 1024, corpus: 'mC4 + CC', languages: '94', avgSimilarity: 0.75 },
  { model: 'LaBSE', dimension: 768, corpus: 'CommonCrawl', languages: '109', avgSimilarity: 0.73 },
  { model: 'mUSE', dimension: 512, corpus: 'Wikipedia', languages: '16', avgSimilarity: 0.70 },
];

export const similarityData = [
  { pair: 'Q-D Same Lang', bge: 0.85, me5: 0.82, labse: 0.80, muse: 0.76 },
  { pair: 'Q-D Cross Lang', bge: 0.72, me5: 0.69, labse: 0.71, muse: 0.64 },
  { pair: 'D-D Same Topic', bge: 0.68, me5: 0.65, labse: 0.63, muse: 0.60 },
  { pair: 'D-D Diff Topic', bge: 0.32, me5: 0.30, labse: 0.29, muse: 0.28 },
];

export const pcaData = [
  { x: -2.5, y: 1.8, cluster: 'EN-Technical' },
  { x: -2.2, y: 1.5, cluster: 'EN-Technical' },
  { x: -2.8, y: 2.1, cluster: 'EN-Technical' },
  { x: 1.8, y: -1.5, cluster: 'VI-Technical' },
  { x: 2.1, y: -1.8, cluster: 'VI-Technical' },
  { x: 1.5, y: -1.2, cluster: 'VI-Technical' },
  { x: 0.5, y: 2.3, cluster: 'EN-General' },
  { x: 0.8, y: 2.6, cluster: 'EN-General' },
  { x: 0.2, y: 2.0, cluster: 'EN-General' },
  { x: -1.2, y: -2.1, cluster: 'ZH-Technical' },
  { x: -1.5, y: -2.4, cluster: 'ZH-Technical' },
  { x: -0.9, y: -1.8, cluster: 'ZH-Technical' },
];

export const intraLingualData = [
  { model: 'BGE-M3', en: 0.85, vi: 0.82, zh: 0.80, es: 0.83 },
  { model: 'mE5-large', en: 0.82, vi: 0.79, zh: 0.77, es: 0.80 },
  { model: 'LaBSE', en: 0.80, vi: 0.78, zh: 0.76, es: 0.79 },
  { model: 'mUSE', en: 0.76, vi: 0.73, zh: 0.71, es: 0.74 },
];

export const crossLingualData = [
  { model: 'BGE-M3', envi: 0.72, enzh: 0.68, enes: 0.76, vizh: 0.65 },
  { model: 'mE5-large', envi: 0.69, enzh: 0.65, enes: 0.73, vizh: 0.62 },
  { model: 'LaBSE', envi: 0.71, enzh: 0.67, enes: 0.75, vizh: 0.64 },
  { model: 'mUSE', envi: 0.64, enzh: 0.60, enes: 0.68, vizh: 0.58 },
];
