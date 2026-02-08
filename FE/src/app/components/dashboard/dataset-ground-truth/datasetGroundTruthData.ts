export interface QAPair {
  id: string;

  question: string;
  answer: string;
  context?: string;

  model: string;
  language: 'en' | 'vi';

  source_pdf: string;

  // Step 1 (Bi-encoder)
  sim_qc: number;
  sim_ac: number;
  verified: boolean;

  // Step 2 (Cross-encoder)
  ce_multi_prob: number;
  verified_step2: boolean;
}



export interface Dataset {
  id: string;

  name: string;

  source: 'VJOL' | 'SemanticScholar';
  language: 'VI' | 'EN';

  experiment: string;      // exp1, exp2...
  model: string;           // gemini-2.5-flash

  qaPairs: number;

  avgBiEncoder: number;    // avg sim_qc
  avgCrossEncoder: number; // avg ce_multi_prob
}


export const mockQAPairs: QAPair[] = [
  {
    id: 'QA001',
    question: 'What is the main advantage of transformer architecture over RNNs?',
    answer: 'Transformers can process sequences in parallel using self-attention mechanisms, eliminating the sequential bottleneck of RNNs and enabling better long-range dependency modeling.',
    sourceChunkId: 'chunk_001_p12',
    language: 'EN',
    similarityScore: 0.92,
    verificationStatus: 'Verified',
    context: 'The transformer architecture introduced by Vaswani et al. revolutionized natural language processing. Unlike recurrent neural networks (RNNs), transformers can process sequences in parallel using self-attention mechanisms, eliminating the sequential bottleneck of RNNs and enabling better long-range dependency modeling. This parallel processing capability significantly reduces training time while improving model performance on various NLP tasks.',
    documentTitle: 'Attention Is All You Need - Vaswani et al.',
    pageNumber: 12,
    qContextSimilarity: 0.94,
    aContextSimilarity: 0.89,
    dataset: 'ArXiv CS Papers',
    model: 'GPT-5.2'
  },
  {
    id: 'QA002',
    question: 'Mô hình embedding đa ngôn ngữ hoạt động như thế nào?',
    answer: 'Mô hình embedding đa ngôn ngữ được huấn luyện trên các câu song song từ nhiều ngôn ngữ để học một không gian biểu diễn chung, cho phép các câu có ý nghĩa tương tự được biểu diễn gần nhau bất kể ngôn ngữ.',
    sourceChunkId: 'chunk_234_p45',
    language: 'VI',
    similarityScore: 0.88,
    verificationStatus: 'Verified',
    context: 'Các mô hình embedding đa ngôn ngữ như LASER, mBERT và XLM-RoBERTa đã chứng minh khả năng học biểu diễn ngôn ngữ cross-lingual hiệu quả. Các mô hình này được huấn luyện trên các câu song song từ nhiều ngôn ngữ để học một không gian biểu diễn chung. Kiến trúc đa ngôn ngữ cho phép các câu có ý nghĩa tương tự được biểu diễn gần nhau trong không gian vector bất kể ngôn ngữ của chúng, tạo điều kiện cho các ứng dụng như dịch máy không giám sát, tìm kiếm cross-lingual và phân loại văn bản đa ngôn ngữ.',
    documentTitle: 'Multilingual Embeddings for NLP - Research Paper',
    pageNumber: 45,
    qContextSimilarity: 0.91,
    aContextSimilarity: 0.85,
    dataset: 'Vietnamese Research Papers',
    model: 'GPT-5.2'
  },
  {
    id: 'QA003',
    question: 'How does RAG improve LLM factual accuracy?',
    answer: 'RAG retrieves relevant documents from external knowledge bases and grounds LLM responses in factual context, reducing hallucinations by providing verifiable sources that constrain generation.',
    sourceChunkId: 'chunk_456_p23',
    language: 'EN',
    similarityScore: 0.91,
    verificationStatus: 'Verified',
    context: 'Retrieval-Augmented Generation (RAG) significantly improves large language model factual accuracy through a two-stage process. First, the system retrieves relevant documents from external knowledge bases using semantic search. Then, these documents are provided as context to the LLM during generation. This approach grounds LLM responses in factual context from reliable sources, dramatically reducing hallucinations by providing verifiable information that constrains the generation process. RAG combines the parametric knowledge of LLMs with non-parametric retrieval, enabling models to access up-to-date information without retraining.',
    documentTitle: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    pageNumber: 23,
    qContextSimilarity: 0.93,
    aContextSimilarity: 0.88,
    dataset: 'ArXiv CS Papers',
    model: 'Gemini 2.5 Flash'
  },
  {
    id: 'QA004',
    question: 'Tại sao vector database quan trọng trong semantic search?',
    answer: 'Vector database cho phép lưu trữ và tìm kiếm hiệu quả các embeddings có chiều cao, sử dụng các thuật toán như HNSW để thực hiện tìm kiếm gần đúng hàng xóm gần nhất (ANN) với độ trễ thấp.',
    sourceChunkId: 'chunk_789_p67',
    language: 'VI',
    similarityScore: 0.86,
    verificationStatus: 'Verified',
    context: 'Trong hệ thống semantic search hiện đại, vector databases đóng vai trò then chốt. Các hệ thống như Pinecone, Weaviate và Milvus cho phép lưu trữ và tìm kiếm hiệu quả các embeddings có chiều cao (thường 384-1536 chiều). Vector databases sử dụng các thuật toán indexing tiên tiến như HNSW (Hierarchical Navigable Small World) để thực hiện tìm kiếm gần đúng hàng xóm gần nhất (Approximate Nearest Neighbor - ANN) với độ trễ thấp, cho phép tìm kiếm trong hàng triệu vectors trong vài milliseconds. Khả năng này là nền tảng cho các ứng dụng search semantic thời gian thực.',
    documentTitle: 'Vector Databases for Production ML Systems',
    pageNumber: 67,
    qContextSimilarity: 0.89,
    aContextSimilarity: 0.84,
    dataset: 'Vietnamese Research Papers',
    model: 'Gemini 2.5 Flash'
  },
  {
    id: 'QA005',
    question: '混合搜索如何平衡关键词和语义检索？',
    answer: '混合搜索结合BM25统计算法和向量语义搜索，通过倒数排名融合(RRF)或加权组合整合结果，既保持关键词精确性又理解语义相似性。',
    sourceChunkId: 'chunk_667_p52',
    language: 'ZH',
    similarityScore: 0.81,
    verificationStatus: 'Verified',
    context: '检索系统面临关键词精确匹配与语义理解的平衡挑战。混合搜索策略整合了传统的BM25统计算法和现代的向量语义搜索。BM25基于词频和文档频率，擅长捕捉精确的关键词匹配，而向量搜索通过深度学习理解语义相似性。实践中，系统并行执行两种检索，然后使用Reciprocal Rank Fusion (RRF)或加权线性组合等融合策略整合结果。这种方法在处理专业术语查询时保持精确性，同时能理解同义词和语义变体，显著提升检索质量。',
    documentTitle: '混合检索系统设计与实现',
    pageNumber: 52,
    qContextSimilarity: 0.84,
    aContextSimilarity: 0.79,
    dataset: 'Chinese Technical Docs',
    model: 'GPT-5.2'
  },
];

