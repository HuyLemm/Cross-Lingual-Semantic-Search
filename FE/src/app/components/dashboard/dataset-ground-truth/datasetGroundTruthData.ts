export interface QAPair {
  /* =========================
   * IDENTITY
   * ========================= */
  id: string;               // qa_id
  model: string;
  language: 'en' | 'vi';

  /* =========================
   * CONTENT
   * ========================= */
  question: string;
  answer: string;
  context?: string;

  /* =========================
   * SOURCE
   * ========================= */
  sourceDocument: string;   // source_pdf

  /* =========================
   * STEP 1 — BI ENCODER
   * ========================= */
  sim_qc: number;           // question ↔ context similarity
  sim_ac: number;           // answer ↔ context similarity
  verified: boolean;        // pass step1

  /* =========================
   * STEP 2 — CROSS ENCODER
   * ========================= */
  ce_multi_prob: number;    // entailment probability
  verified_step2: boolean;  // pass step2
}




export interface Dataset {
  id: string;

  name: string;

  source: 'VJOL' | 'SemanticScholar';
  language: 'en' | 'vi';

  experiment: string;      // exp1, exp2...
  model: string;           // gemini-2.5-flash

  qaPairs: number;

  avgBiEncoder: number;    // avg sim_qc
  avgCrossEncoder: number; // avg ce_multi_prob
}




