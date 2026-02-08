// Types and interfaces
export interface ModelItem {
  id: number;
  name: string;
  path: string;
  enabled: boolean;
}

export interface DatasetItem {
  id: number;
  name: string;
  path: string;
  enabled: boolean;
}

// Mock data
export const defaultModels: ModelItem[] = [
  { id: 1, name: 'BGE-M3', path: 'BAAI/bge-m3', enabled: true },
  { id: 2, name: 'mE5-large', path: 'intfloat/multilingual-e5-large', enabled: true },
  { id: 3, name: 'LaBSE', path: 'sentence-transformers/LaBSE', enabled: true },
  { id: 4, name: 'mUSE', path: 'universal-sentence-encoder-multilingual', enabled: false },
];

export const defaultDatasets: DatasetItem[] = [
  { id: 1, name: 'ArXiv Multilingual', path: 'data/arxiv-multilingual', enabled: true },
  { id: 2, name: 'Wikipedia QA', path: 'data/wiki-qa', enabled: true },
  { id: 3, name: 'Thesis Corpus', path: 'data/thesis-corpus', enabled: false },
];
