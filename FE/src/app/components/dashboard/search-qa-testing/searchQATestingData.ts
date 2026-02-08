export interface SearchResult {
  id: number;
  text: string;
  score: number;
  source: string;
  language: string;
  chunkId: string;
  position: number;
}

export const mockSearchResults: SearchResult[] = [
  {
    id: 1,
    text: "Transformers have revolutionized natural language processing by introducing attention mechanisms that allow models to weigh the importance of different words in context...",
    score: 0.94,
    source: "attention_is_all_you_need.pdf",
    language: "en",
    chunkId: "chunk_001",
    position: 2,
  },
  {
    id: 2,
    text: "Cross-lingual models leverage multilingual training data to create shared semantic spaces across languages, enabling zero-shot transfer...",
    score: 0.89,
    source: "multilingual_embeddings.pdf",
    language: "en",
    chunkId: "chunk_142",
    position: 5,
  },
  {
    id: 3,
    text: "Vector databases optimize similarity search through indexing structures like HNSW and IVF, balancing speed and recall...",
    score: 0.86,
    source: "vector_search_systems.pdf",
    language: "en",
    chunkId: "chunk_089",
    position: 3,
  },
  {
    id: 4,
    text: "Retrieval-augmented generation combines dense retrieval with language models to ground responses in factual knowledge...",
    score: 0.82,
    source: "rag_systems.pdf",
    language: "en",
    chunkId: "chunk_231",
    position: 1,
  },
  {
    id: 5,
    text: "Semantic chunking strategies improve retrieval by preserving contextual boundaries and maintaining coherent information units...",
    score: 0.79,
    source: "chunking_strategies.pdf",
    language: "en",
    chunkId: "chunk_312",
    position: 7,
  },
];

export const groundTruth = {
  question: "How do transformer models process sequences?",
  expectedAnswer: "Transformers use self-attention mechanisms to process sequences in parallel, computing attention weights for all positions simultaneously...",
  sourceChunk: "chunk_001"
};
