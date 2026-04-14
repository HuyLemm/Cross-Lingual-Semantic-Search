export interface QAPair {
  id: string;               
  model: string;
  language: 'en' | 'vi';

  question: string;
  answer: string;
  context: string;

  sourceDocument: string;   // source_pdf

  chunk_id?: string | null;     // e.g. "0001"
  chunk_char_len?: number;      // length of chunk
  chunk_preview?: string;

  sim_qc: number;
  sim_ac: number;
  verified: boolean;

  ce_multi_prob: number;
  verified_step2: boolean;
}

export interface Dataset {
  id: string;

  name: string;

  source: 'VJOL' | 'SemanticScholar';
  language: 'en' | 'vi';

  experiment: number;     // exp1, exp2...
  model: string;           // gemini-2.5-flash

  qaPairs: number;

  avgBiEncoder: number;    // avg sim_qc
  avgCrossEncoder: number; // avg ce_multi_prob
}




