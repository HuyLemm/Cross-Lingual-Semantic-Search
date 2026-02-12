// utils.js
import fs from "fs";
import path from "path";

/* =========================================================
 * NORMALIZE HELPERS
 * ========================================================= */

export function getAvailableExperiments() {
  const expRoot = path.join(process.cwd(), "dataModel", "exp");

  if (!fs.existsSync(expRoot)) return [];

  const experiments = [];

  const dirs = fs.readdirSync(expRoot, { withFileTypes: true });

  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    if (!d.name.startsWith("exp")) continue;

    const expPath = path.join(expRoot, d.name);

    // check có ít nhất 1 JSON
    const files = fs.readdirSync(expPath);
    const hasJson = files.some((f) => f.endsWith(".json"));

    if (hasJson) experiments.push(d.name);
  }

  // sort exp1 → exp17
  experiments.sort((a, b) => {
    const na = Number(a.replace("exp", ""));
    const nb = Number(b.replace("exp", ""));
    return na - nb;
  });

  return experiments;
}

export function normalizeModel(raw) {
  if (!raw) return "unknown";

  const m = String(raw).toLowerCase();

  if (m.includes("deepseek")) return "deepseek";
  if (m.includes("gemini")) return "gemini";
  if (m.includes("gpt")) return "gpt";

  return "unknown";
}

export function normalizeLang(raw) {
  if (!raw) return "unknown";

  const s = String(raw).toLowerCase();

  if (s.startsWith("en")) return "en";
  if (s.startsWith("vi")) return "vi";

  return "unknown";
}

/* =========================================================
 * DEDUPE QA
 * ========================================================= */
export function dedupeContent(qas) {
  const seen = new Set();

  return qas.filter((q) => {
    const key = `${q.source_pdf?.toLowerCase()}||${q.question?.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* =========================================================
 * 1. COUNT DOCUMENTS
 * ========================================================= */
export function countDocuments({ dataset }) {
  const base = path.join(process.cwd(), "data");

  const enDir = path.join(base, "articles_en");
  const viDir = path.join(base, "articles_vi");

  const countPdf = (dir) =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".pdf"))
          .length
      : 0;

  if (dataset === "semantic_scholar") return countPdf(enDir);
  if (dataset === "vjol") return countPdf(viDir);

  return countPdf(enDir) + countPdf(viDir);
}

/* =========================================================
 * 2. LOAD QA FROM EXPERIMENT FOLDER
 * ========================================================= */
export function loadTotalQAs({
  dataset = "all",
  model = "all",
  experiment = "all",
}) {
  const base = path.join(process.cwd(), "dataModel", "exp");
  if (!fs.existsSync(base)) return [];

  /* ======================= LOAD EXP FOLDERS ======================= */
  let expFolders = [];

  if (experiment === "all") {
    expFolders = fs.readdirSync(base).filter((f) => f.startsWith("exp"));
  } else {
    expFolders = [experiment];
  }

  let all = [];

  /* ======================= LOAD FILES ======================= */
  for (const exp of expFolders) {
    const expPath = path.join(base, exp);
    if (!fs.existsSync(expPath)) continue;

    const files = fs.readdirSync(expPath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(expPath, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (Array.isArray(data)) {
          all.push(...data);
        }
      } catch {
        console.warn("Skip broken JSON:", filePath);
      }
    }
  }

  /* ======================= FILTER MODEL ======================= */
  if (model !== "all") {
    all = all.filter((q) => normalizeModel(q.model) === model);
  }

  /* ======================= FILTER DATASET / LANGUAGE ======================= */
  if (dataset !== "all") {
    all = all.filter((q) => {
      const lang = normalizeLang(q.language);

      if (dataset === "semantic_scholar") return lang === "en";
      if (dataset === "vjol") return lang === "vi";

      return true;
    });
  }

  return all;
}

/* =========================================================
 * 3. QUALITY FILTER
 * ========================================================= */
export function applyQualityFilter(qas, quality) {
  let threshold = 0.7;

  if (quality && quality !== "all") {
    const t = Number(quality);
    if (!Number.isNaN(t)) threshold = t;
  }

  return qas.filter((q) => {
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
  const { search = "" } = query;

  if (!search) return qas;

  const s = search.toLowerCase();

  return qas.filter(
    (q) =>
      q.title?.toLowerCase().includes(s) ||
      q.question?.toLowerCase().includes(s) ||
      q.context?.toLowerCase().includes(s) ||
      q.source_pdf?.toLowerCase().includes(s),
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
 * 6. GET EXPERIMENT LIST BY MODEL
 * ========================================================= */
/* =========================================================
 * GET EXPERIMENT LIST BY MODEL + DATASET (LANG)
 * ========================================================= */
export function getExperimentsByModel(model = "all", dataset = "all") {
  const base = path.join(process.cwd(), "dataModel", "exp");
  if (!fs.existsSync(base)) return [];

  const exps = fs.readdirSync(base).filter((d) => d.startsWith("exp"));
  if (model === "all" || dataset === "all") return exps.sort();

  const lang = dataset === "semantic_scholar" ? "en" : "vi";
  const result = [];

  for (const e of exps) {
    const expDir = path.join(base, e);
    if (!fs.existsSync(expDir)) continue;

    const files = fs.readdirSync(expDir);

    const hasModelLang = files.some((f) => {
      const name = f.toLowerCase();

      const matchModel =
        (model === "gpt" && name.startsWith("gpt")) ||
        (model === "gemini" && name.startsWith("gemini")) ||
        (model === "deepseek" && name.startsWith("deepseek"));

      const matchLang = name.includes(`_${lang}`);

      return matchModel && matchLang;
    });

    hint: if (hasModelLang) result.push(e);
  }

  // sort exp1 → exp17
  return result.sort(
    (a, b) => Number(a.replace("exp", "")) - Number(b.replace("exp", "")),
  );
}

