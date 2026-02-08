// utils.js
import fs from 'fs';
import path from 'path';

export function dedupeContent(qas) {
  const seen = new Set();

  return qas.filter(q => {
    const key = `${q.source_pdf?.toLowerCase()}||${q.question?.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}


/* =========================================================
 * 1. COUNT DOCUMENTS (PDF)
 * ========================================================= */
export function countDocuments({ dataset }) {
  const base = path.join(process.cwd(), 'data');

  const enDir = path.join(base, 'articles_en');
  const viDir = path.join(base, 'articles_vi');

  const countPdf = (dir) =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf')).length
      : 0;

  if (dataset === 'semantic_scholar') return countPdf(enDir);
  if (dataset === 'vjol') return countPdf(viDir);

  return countPdf(enDir) + countPdf(viDir);
}

/* =========================================================
 * 2. LOAD QA FROM EXPERIMENT FOLDER
 * ========================================================= */
export function loadTotalQAs({
  dataset = 'all',
  model = 'all',
  experiment = 'all',
}) {
  const base = path.join(process.cwd(), 'dataModel', 'exp');
  if (!fs.existsSync(base)) return [];

  const expFolders =
    experiment === 'all'
      ? fs.readdirSync(base)
      : [experiment];

  let all = [];

  for (const exp of expFolders) {
    const expPath = path.join(base, exp);
    if (!fs.existsSync(expPath)) continue;

    const files = fs.readdirSync(expPath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(expPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      all = all.concat(data);
    }
  }

  // =====================
  // FILTER MODEL
  // =====================
  if (model !== 'all') {
    all = all.filter(q => normalizeModel(q.model) === model);
  }

  // =====================
  // FILTER DATASET / LANGUAGE
  // =====================
  if (dataset === 'semantic_scholar') {
    all = all.filter(q => q.language === 'en');
  }

  if (dataset === 'vjol') {
    all = all.filter(q => q.language === 'vi');
  }

  return all;
}

/* =========================================================
 * 3. QUALITY FILTER (FROM RAW QA)
 * ========================================================= */
export function applyQualityFilter(qas, quality) {
  // 🔹 DEFAULT threshold = 0.7
  let threshold = 0.7;

  if (quality && quality !== 'all') {
    const t = Number(quality);
    if (!Number.isNaN(t)) threshold = t;
  }

  return qas.filter(q => {
    const pass1 = q.verified === true;
    const pass2 = q.verified_step2 === true;
    if (!pass1 || !pass2) return false;

    const sim = q.sim_qc ?? 0;
    const ce = q.ce_multi_prob ?? 0;

    return sim >= threshold && ce >= threshold;
  });
}



/* =========================================================
 * 4. APPLY SEARCH FILTER
 * ========================================================= */
export function applyFilters(qas, query) {
  const { search = '' } = query;

  if (!search) return qas;

  const s = search.toLowerCase();

  return qas.filter(q =>
    q.title?.toLowerCase().includes(s) ||
    q.question?.toLowerCase().includes(s) ||
    q.context?.toLowerCase().includes(s) ||
    q.source_pdf?.toLowerCase().includes(s)
  );
}

/* =========================================================
 * 5. COMPUTE METRICS
 * ========================================================= */
export function computeFullMetrics(qas) {
  const total = qas.length;

  let step1Pass = 0;
  let step2Pass = 0;
  let step1Only = 0;

  let sumBi = 0;
  let sumCE = 0;

  for (const qa of qas) {
    const pass1 = qa.verified === true;
    const pass2 = qa.verified_step2 === true;

    if (pass1) step1Pass++;
    if (pass1 && !pass2) step1Only++;

    if (pass1 && pass2) {
      step2Pass++;
      sumBi += qa.sim_qc || 0;
      sumCE += qa.ce_multi_prob || 0;
    }
  }

  const avgBiEncoder = step2Pass === 0 ? 0 : sumBi / step2Pass;
  const avgCrossEncoder = step2Pass === 0 ? 0 : sumCE / step2Pass;

  const validationRate = total === 0 ? 0 : (step2Pass / total) * 100;
  const step1OnlyRate = total === 0 ? 0 : (step1Only / total) * 100;

  return {
    avgBiEncoder: Number(avgBiEncoder.toFixed(3)),
    avgCrossEncoder: Number(avgCrossEncoder.toFixed(3)),
    validationRate: Number(validationRate.toFixed(1)),
    step1OnlyRate: Number(step1OnlyRate.toFixed(1)),
  };
}

/* =========================================================
 * 6. NORMALIZE MODEL NAME
 * (map raw → frontend value)
 * ========================================================= */
function normalizeModel(raw) {
  if (!raw) return 'unknown';

  const m = raw.toLowerCase();

  if (m.includes('deepseek')) return 'deepseek';
  if (m.includes('gemini')) return 'gemini';
  if (m.includes('gpt')) return 'gpt';

  return raw;
}

export function getExperimentsByModel(model = 'all') {
  const base = path.join(process.cwd(), 'dataModel', 'exp');
  if (!fs.existsSync(base)) return [];

  const exps = fs.readdirSync(base).filter(d => d.startsWith('exp'));

  if (model === 'all') return exps.sort();

  const result = [];

  for (const e of exps) {
    const expDir = path.join(base, e);
    const files = fs.readdirSync(expDir);

    const hasModel = files.some(f =>
      f.toLowerCase().includes(model.toLowerCase())
    );

    if (hasModel) result.push(e);
  }

  return result.sort();
}

