// backend/services/crossModelComparison.service.js
import { loadTotalQAs, normalizeLang } from "../utils/utils.js";

/**
 * =========================
 * CACHE
 * =========================
 */
const CACHE = new Map(); // key -> result
function cacheKey({ dataset, experiment, threshold }) {
  return `${dataset}||${experiment}||${threshold}`;
}

/**
 * =========================
 * DEDUPE (question + answer)
 * =========================
 */
function normText(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function dedupeQAByQuestionAnswer(qas) {
  const seen = new Set();
  const out = [];
  for (const q of qas) {
    const qq = normText(q?.question);
    const aa = normText(q?.answer);
    if (!qq || !aa) continue;
    const key = `${qq}||${aa}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/**
 * =========================
 * STRICT VERIFIED (Option A)
 * =========================
 */
function safeNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function isValidated(q) {
  return q?.verified === true && q?.verified_step2 === true;
}

// ✅ strict verified definition you chose
function passStrictVerified(q, th) {
  if (!isValidated(q)) return false;
  const sim_qc = safeNum(q.sim_qc, 0);
  const sim_ac = safeNum(q.sim_ac, 0);
  const ce = safeNum(q.ce_multi_prob, 0);
  return sim_qc >= th && sim_ac >= th && ce >= th;
}

function avg(arr, getter) {
  if (!arr.length) return 0;
  const s = arr.reduce((acc, x) => acc + getter(x), 0);
  return s / arr.length;
}

function pct(n, d) {
  return d === 0 ? 0 : (n / d) * 100;
}

function modelLabel(group) {
  if (group === "gpt") return "GPT-5.2";
  if (group === "gemini") return "Gemini 2.5";
  if (group === "deepseek") return "DeepSeek R1T2";
  return group;
}

/**
 * =========================
 * MAIN BUILDER
 * =========================
 * Avg Similarity / Avg Entailment:
 * ✅ computed on VERIFIED-ONLY subset (strict)
 *
 * Verified %:
 * ✅ strict verified count / totalQA (still meaningful)
 */
export function buildCrossModelComparison(query) {
  const { dataset = "all", experiment = "all", threshold = "0.8" } = query;

  const th = (() => {
    const n = Number(threshold);
    return Number.isFinite(n) ? n : 0.8;
  })();

  const key = cacheKey({ dataset, experiment, threshold: th });
  if (CACHE.has(key)) return CACHE.get(key);

  const MODELS = ["gpt", "gemini", "deepseek"];

  const rows = [];

  // Radar values
  const radar = {
    similarity: {},     // 0..1 (avg similarity on verified-only)
    entailment: {},     // 0..1 (avg CE on verified-only)
    verifiedRatio: {},  // 0..1 (strict verified / total)
  };

  for (const model of MODELS) {
    // load + dedupe for this model
    let qas = loadTotalQAs({ dataset, model, experiment });
    qas = dedupeQAByQuestionAnswer(qas);

    const totalQA = qas.length;

    const en = qas.filter((q) => normalizeLang(q.language) === "en");
    const vi = qas.filter((q) => normalizeLang(q.language) === "vi");

    // strict verified subsets
    const verifiedQAs = qas.filter((q) => passStrictVerified(q, th));
    const enVerifiedQAs = en.filter((q) => passStrictVerified(q, th));
    const viVerifiedQAs = vi.filter((q) => passStrictVerified(q, th));

    const verifiedCount = verifiedQAs.length;
    const enVerifiedCount = enVerifiedQAs.length;
    const viVerifiedCount = viVerifiedQAs.length;

    // ✅ Avg metrics computed on VERIFIED-ONLY
    const avgSimVerified = avg(verifiedQAs, (q) => {
      const sim_qc = safeNum(q.sim_qc, 0);
      const sim_ac = safeNum(q.sim_ac, 0);
      return (sim_qc + sim_ac) / 2;
    });

    const avgEntVerified = avg(verifiedQAs, (q) => safeNum(q.ce_multi_prob, 0));

    // percentages
    const verifiedPct = pct(verifiedCount, totalQA);
    const enVerifiedPct = pct(enVerifiedCount, en.length);
    const viVerifiedPct = pct(viVerifiedCount, vi.length);

    const label = modelLabel(model);

    rows.push({
      model: label,
      totalQA,

      // ✅ verified-only averages
      avgSimilarity: Number(avgSimVerified.toFixed(3)),
      avgEntailment: Number(avgEntVerified.toFixed(3)),

      verified: Number(verifiedPct.toFixed(1)),
      enVerified: Number(enVerifiedPct.toFixed(1)),
      viVerified: Number(viVerifiedPct.toFixed(1)),

      // (optional debug fields if you ever need)
      // verifiedCount,
    });

    // radar values
    radar.similarity[label] = Number(avgSimVerified.toFixed(3));
    radar.entailment[label] = Number(avgEntVerified.toFixed(3));
    radar.verifiedRatio[label] = Number(
      (totalQA === 0 ? 0 : verifiedCount / totalQA).toFixed(3)
    );
  }

  const radarComparisonData = [
    { metric: "Avg Similarity", ...radar.similarity },
    { metric: "Avg Entailment", ...radar.entailment },
    { metric: "Verified Ratio", ...radar.verifiedRatio },
  ];

  const result = { crossModelComparison: rows, radarComparisonData };
  CACHE.set(key, result);
  return result;
}

export function clearCrossModelCaches() {
  CACHE.clear();
}