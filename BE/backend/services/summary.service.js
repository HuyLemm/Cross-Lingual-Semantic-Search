import {
  countDocuments,
  loadTotalQAs,
  applyQualityFilter,
  dedupeContent,
  normalizeModel,
  normalizeLang,
  getAvailableExperiments,
} from "../utils/utils.js";

import path from "path";
import fs from "fs";

/* =========================================================
 * CACHE LAYER (giữ đủ filter)
 * - QA_CACHE: cache theo (dataset/model/experiment)
 * - SUMMARY_CACHE: cache theo (dataset/model/experiment/quality)
 * - DATASET_OVERVIEW_CACHE: cache 1 lần
 * ========================================================= */

const QA_CACHE = new Map(); // key -> qas[]
const SUMMARY_CACHE = new Map(); // key -> summary result
let DATASET_OVERVIEW_CACHE = null;

/* =========================================================
 * HELPERS
 * ========================================================= */

function qaCacheKey({ dataset, model, experiment }) {
  return `${dataset}||${model}||${experiment}`;
}

function summaryCacheKey({ dataset, model, experiment, quality }) {
  return `${dataset}||${model}||${experiment}||${quality}`;
}

function getQAsCached({ dataset = "all", model = "all", experiment = "all" }) {
  const key = qaCacheKey({ dataset, model, experiment });

  if (QA_CACHE.has(key)) return QA_CACHE.get(key);

  // ✅ giữ logic filter gốc: loadTotalQAs() xử lý dataset/model/experiment
  let qas = loadTotalQAs({ dataset, model, experiment });

  // ✅ dedupe 1 lần cho combo này
  qas = dedupeContent(qas);

  QA_CACHE.set(key, qas);
  return qas;
}

/* =========================================================
 * SUMMARY
 * ========================================================= */
export function buildSummary(query) {
  const {
    dataset = "all",
    model = "all",
    experiment = "all",
    quality = "0.7",
  } = query;

  const sKey = summaryCacheKey({ dataset, model, experiment, quality });
  if (SUMMARY_CACHE.has(sKey)) return SUMMARY_CACHE.get(sKey);

  // 1) load + dedupe (cached)
  const qas = getQAsCached({ dataset, model, experiment });

  const totalQAPairs = qas.length;

  // 2) verified theo quality
  const verifiedQAs = applyQualityFilter(qas, quality);
  const verifiedQAPairs = verifiedQAs.length;

  // 3) validation rate
  const validationRate =
    totalQAPairs === 0
      ? 0
      : Number(((verifiedQAPairs / totalQAPairs) * 100).toFixed(1));

  // 4) avg scores (trên verified)
  let avgBiEncoder = 0;
  let avgCrossEncoder = 0;

  if (verifiedQAPairs > 0) {
    const sumBi = verifiedQAs.reduce((s, q) => s + (q.sim_qc || 0), 0);
    const sumCE = verifiedQAs.reduce((s, q) => s + (q.ce_multi_prob || 0), 0);
    avgBiEncoder = Number((sumBi / verifiedQAPairs).toFixed(3));
    avgCrossEncoder = Number((sumCE / verifiedQAPairs).toFixed(3));
  }

  // 5) step1-only rate (reactive theo quality)
  const th = Number(quality || 0.7);

  const step1OnlyCount = qas.filter(
    (q) =>
      q.verified === true && q.verified_step2 !== true && (q.sim_qc ?? 0) >= th,
  ).length;

  const step1OnlyRate =
    totalQAPairs === 0
      ? 0
      : Number(((step1OnlyCount / totalQAPairs) * 100).toFixed(1));

  const totalDocuments = countDocuments({ dataset });

  const result = {
    totalDocuments,
    totalQAPairs,
    verifiedQAPairs,
    avgBiEncoder,
    avgCrossEncoder,
    validationRate,
    step1OnlyRate,
  };

  SUMMARY_CACHE.set(sKey, result);
  return result;
}

/* =========================================================
 * QA LIST
 * ========================================================= */
export function buildQAList(query) {
  const {
    page = 1,
    pageSize = 20,
    dataset = "all",
    model = "all",
    experiment = "all",
    search = "",
    quality = "0.7", // chỉ để frontend biết threshold, KHÔNG filter list
  } = query;

  // 1) load + dedupe (cached)
  let qas = getQAsCached({ dataset, model, experiment });

  // 2) search filter
  if (search) {
    const s = String(search).toLowerCase();
    qas = qas.filter(
      (q) =>
        q.question?.toLowerCase().includes(s) ||
        q.answer?.toLowerCase().includes(s) ||
        q.source_pdf?.toLowerCase().includes(s),
    );
  }

  // 3) sort
  const MODEL_ORDER = { gpt: 1, gemini: 2, deepseek: 3 };

  qas.sort((a, b) => {
    const ma = MODEL_ORDER[normalizeModel(a.model)] ?? 99;
    const mb = MODEL_ORDER[normalizeModel(b.model)] ?? 99;
    if (ma !== mb) return ma - mb;

    const sa = (a.source_pdf || "").toLowerCase();
    const sb = (b.source_pdf || "").toLowerCase();
    if (sa !== sb) return sa.localeCompare(sb);

    const qaA = String(a.qa_id || "");
    const qaB = String(b.qa_id || "");
    return qaA.localeCompare(qaB);
  });

  // 4) zip EN_i ↔ VI_i khi dataset = "all"
  if (dataset === "all") {
    const en = [];
    const vi = [];

    for (const q of qas) {
      const lang = normalizeLang(q.language);
      if (lang === "en") en.push(q);
      else if (lang === "vi") vi.push(q);
    }

    const mixed = [];
    const maxLen = Math.max(en.length, vi.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < en.length) mixed.push(en[i]);
      if (i < vi.length) mixed.push(vi[i]);
    }

    qas = mixed;
  }

  // 5) pagination
  const p = Number(page);
  const ps = Number(pageSize);
  const start = (p - 1) * ps;
  const pageItems = qas.slice(start, start + ps);

  // 6) reindex QA_ID (đúng theo list sau filter/search/zip)
  let counter = start;

  const items = pageItems.map((q) => {
    counter++;
    const indexStr = String(counter).padStart(6, "0");

    const modelNorm = normalizeModel(q.model);
    const langNorm = normalizeLang(q.language);

    return {
      id: `QA_${modelNorm}_${langNorm}_${indexStr}`,

      question: q.question,
      answer: q.answer,
      context: q.context,

      model: modelNorm,
      language: langNorm,

      sourceDocument: q.source_pdf,

      sim_qc: Number(q.sim_qc ?? 0),
      sim_ac: Number(q.sim_ac ?? 0),
      verified: Boolean(q.verified),

      ce_multi_prob: Number(q.ce_multi_prob ?? 0),
      verified_step2: Boolean(q.verified_step2),
    };
  });

  return {
    total: qas.length,
    page: p,
    pageSize: ps,
    quality: Number(quality), // ✅ trả về cho frontend dùng highlight màu + status
    items,
  };
}

/* =========================================================
 * DATASET OVERVIEW (cache 1 lần)
 * ========================================================= */
export function buildDatasetOverview() {
  if (DATASET_OVERVIEW_CACHE) return DATASET_OVERVIEW_CACHE;

  const MODELS = ["gpt", "gemini", "deepseek"];
  const LANGS = ["en", "vi"];

  const expRoot = path.join(process.cwd(), "dataModel", "exp");

  const expFolders = fs.existsSync(expRoot)
    ? fs.readdirSync(expRoot).filter((d) => d.startsWith("exp"))
    : [];

  const rows = [];

  for (const model of MODELS) {
    const base = getQAsCached({
      dataset: "all",
      model,
      experiment: "all",
    });

    for (const lang of LANGS) {
      /* ===== COUNT TOTAL EXP ===== */
      let expCount = 0;

      for (const exp of expFolders) {
        const expDir = path.join(expRoot, exp);
        if (!fs.existsSync(expDir)) continue;

        const files = fs.readdirSync(expDir);

        const hasModelLang = files.some((f) => {
          const name = f.toLowerCase();
          return (
            name.includes(model) &&
            ((lang === "en" && name.includes("_en")) ||
              (lang === "vi" && name.includes("_vi")))
          );
        });

        if (hasModelLang) expCount++;
      }

      /* ===== GLOBAL METRICS (NO FILTER) ===== */
      const qas = base.filter((q) => normalizeLang(q.language) === lang);

      const verified = qas.filter(
        (q) => q.verified === true && q.verified_step2 === true,
      );

      const qaPairs = verified.length;

      let avgBi = 0;
      let avgCE = 0;

      if (qaPairs > 0) {
        avgBi = verified.reduce((s, q) => s + (q.sim_qc || 0), 0) / qaPairs;
        avgCE =
          verified.reduce((s, q) => s + (q.ce_multi_prob || 0), 0) / qaPairs;
      }

      rows.push({
        id: `${model}_${lang}`,
        name: `${model.toUpperCase()} ${lang.toUpperCase()}`,
        source: lang === "vi" ? "VJOL" : "SemanticScholar",
        language: lang.toUpperCase(),
        experiment: expCount,
        model,
        qaPairs,
        avgBiEncoder: Number(avgBi.toFixed(3)),
        avgCrossEncoder: Number(avgCE.toFixed(3)),
      });
    }
  }

  DATASET_OVERVIEW_CACHE = rows;
  return rows;
}
