// app/(whatever)/backend/services/qaEvaluation.service.js
import { loadTotalQAs } from "../utils/utils.js";

/**
 * =========================
 * CACHE
 * =========================
 */
const QA_CACHE = new Map(); // key -> deduped qas[]
const MODEL_SECTION_CACHE = new Map(); // key -> computed payload (include threshold)

function qaCacheKey({ dataset, model, experiment }) {
  return `${dataset}||${model}||${experiment}`;
}

function modelSectionCacheKey({ dataset, model, experiment, threshold }) {
  return `${dataset}||${model}||${experiment}||${threshold}`;
}

/**
 * Frontend modelId:
 *  - "gpt-5.2"
 *  - "gemini-2.5"
 *  - "deepseek-r1t2"
 */
function normalizeModelIdToGroup(modelId) {
  const m = String(modelId || "").toLowerCase();
  if (m.includes("deepseek")) return "deepseek";
  if (m.includes("gemini")) return "gemini";
  if (m.includes("gpt")) return "gpt";
  return "all";
}

function getModelMeta(modelId) {
  const m = String(modelId || "").toLowerCase();
  if (m.includes("gpt")) return { name: "GPT-5.2", verification: "Bi + Cross" };
  if (m.includes("gemini"))
    return { name: "Gemini 2.5 Flash", verification: "Bi + Cross" };
  if (m.includes("deepseek"))
    return { name: "DeepSeek R1T2", verification: "Bi + Cross" };
  return { name: String(modelId || "Unknown"), verification: "Unknown" };
}

/**
 * =========================
 * NORMALIZE + DEDUPE (q+a)
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
 * LOAD + DEDUPE (CACHED)
 * =========================
 */
function getQAsCached({ dataset = "all", model = "all", experiment = "all" }) {
  const key = qaCacheKey({ dataset, model, experiment });
  if (QA_CACHE.has(key)) return QA_CACHE.get(key);

  let qas = loadTotalQAs({ dataset, model, experiment });

  // ✅ Dedupe strict: question + answer
  qas = dedupeQAByQuestionAnswer(qas);

  QA_CACHE.set(key, qas);
  return qas;
}

/**
 * =========================
 * SCORE HELPERS
 * =========================
 */
function safeNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeLang2(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.startsWith("en")) return "EN";
  if (s.startsWith("vi")) return "VI";
  return "UNK";
}

/**
 * =========================
 * STRICT OPTION A (for KPI Verified)
 * =========================
 * validated = verified && verified_step2
 * strictVerified(th) = validated && sim_qc>=th && sim_ac>=th && ce>=th
 */
function isValidated(qa) {
  return qa?.verified === true && qa?.verified_step2 === true;
}

function passStrictVerified(qa, th) {
  if (!isValidated(qa)) return false;

  const sim_qc = safeNum(qa.sim_qc, 0);
  const sim_ac = safeNum(qa.sim_ac, 0);
  const ce = safeNum(qa.ce_multi_prob, 0);

  return sim_qc >= th && sim_ac >= th && ce >= th;
}

/**
 * =========================
 * SCORE-BASED CLASSIFY (for charts/pie/table)
 * =========================
 * Không require validated để thấy distribution lỗi rõ ràng
 *
 * - verified: biOk && ceOk
 * - entFail: biOk && !ceOk   (Step1 only)
 * - simFail: !biOk && ceOk   (Step2 only)
 * - bothFail: !biOk && !ceOk
 */
function classifyScore(qa, th) {
  const sim_qc = safeNum(qa.sim_qc, 0);
  const sim_ac = safeNum(qa.sim_ac, 0);
  const ce = safeNum(qa.ce_multi_prob, 0);

  const biOk = sim_qc >= th && sim_ac >= th;
  const ceOk = ce >= th;

  if (biOk && ceOk) return "verified";
  if (biOk && !ceOk) return "entFail";
  if (!biOk && ceOk) return "simFail";
  return "bothFail";
}

/**
 * =========================
 * MAIN BUILDER FOR ModelSection.tsx
 * =========================
 */
export function buildModelSectionData(query) {
  const {
    modelId = "gpt-5.2",
    dataset = "all",
    experiment = "all",
    threshold = "0.80",
  } = query;

  const th = (() => {
    const n = Number(threshold);
    return Number.isFinite(n) ? n : 0.8;
  })();

  const modelGroup = normalizeModelIdToGroup(modelId);

  const cacheKey = modelSectionCacheKey({
    dataset,
    model: modelGroup,
    experiment,
    threshold: th,
  });
  if (MODEL_SECTION_CACHE.has(cacheKey)) return MODEL_SECTION_CACHE.get(cacheKey);

  const meta = getModelMeta(modelId);

  // 1) load + dedupe
  const qas = getQAsCached({ dataset, model: modelGroup, experiment });

  // 2) KPI metrics
  const total = qas.length;

  // Similarity KPI = BI OK (sim_qc + sim_ac)  [score-based, không require validated]
  const passedSimilarity = qas.filter((q) => {
    const sim_qc = safeNum(q.sim_qc, 0);
    const sim_ac = safeNum(q.sim_ac, 0);
    return sim_qc >= th && sim_ac >= th;
  }).length;

  // Entailment KPI = CE OK  [score-based]
  const passedEntailment = qas.filter((q) => safeNum(q.ce_multi_prob, 0) >= th).length;

  // Verified KPI = STRICT Option A (validated + 3 metrics)
  const verified = qas.filter((q) => passStrictVerified(q, th)).length;

  // 3) Pie breakdown (score-based để không bị 0 hết)
  let cVerified = 0,
    cStep1Only = 0,
    cStep2Only = 0,
    cBothFail = 0;

  for (const q of qas) {
    const cls = classifyScore(q, th);
    if (cls === "verified") cVerified++;
    else if (cls === "entFail") cStep1Only++;
    else if (cls === "simFail") cStep2Only++;
    else cBothFail++;
  }

  const pieData = [
    { name: "Verified", value: cVerified, color: "#a855f7" },
    { name: "Step1 Only", value: cStep1Only, color: "#3b82f6" },
    { name: "Step2 Only", value: cStep2Only, color: "#10b981" },
    { name: "Failed Both", value: cBothFail, color: "#ef4444" },
  ];

  // 4) bucket by language
  const byLang = { EN: [], VI: [] };
  for (const q of qas) {
    const L = normalizeLang2(q.language);
    if (L === "EN") byLang.EN.push(q);
    else if (L === "VI") byLang.VI.push(q);
  }

  function avg(arr, getter) {
    if (!arr.length) return 0;
    const s = arr.reduce((acc, x) => acc + getter(x), 0);
    return s / arr.length;
  }

  // chartData: avg(sim_qc, sim_ac) + avg(ce) + verifiedRatio (score-based verified ratio)
  const chartData = ["EN", "VI"].map((L) => {
    const arr = byLang[L] || [];
    const qaCount = arr.length;

    const avgSimQC = avg(arr, (q) => safeNum(q.sim_qc, 0));
    const avgSimAC = avg(arr, (q) => safeNum(q.sim_ac, 0));
    const avgCE = avg(arr, (q) => safeNum(q.ce_multi_prob, 0));

    const verCount = arr.filter((q) => classifyScore(q, th) === "verified").length;
    const verifiedRatio = qaCount === 0 ? 0 : verCount / qaCount;

    return {
      language: L,
      similarity: Number(((avgSimQC + avgSimAC) / 2).toFixed(3)),
      entailment: Number(avgCE.toFixed(3)),
      verifiedRatio: Number(verifiedRatio.toFixed(3)),
    };
  });

  // errorDistribution: score-based partition theo language
  const errorDistribution = ["EN", "VI"].map((L) => {
    const arr = byLang[L] || [];
    let v = 0,
      simFail = 0,
      entFail = 0,
      bothFail = 0;

    for (const q of arr) {
      const cls = classifyScore(q, th);
      if (cls === "verified") v++;
      else if (cls === "simFail") simFail++;
      else if (cls === "entFail") entFail++;
      else bothFail++;
    }

    return { language: L, verified: v, simFail, entFail, bothFail };
  });

  // tableData: score-based % theo language (để hiển thị rõ)
  const tableData = ["EN", "VI"].map((L) => {
    const arr = byLang[L] || [];
    const qaCount = arr.length;

    const avgSimQC = avg(arr, (q) => safeNum(q.sim_qc, 0));
    const avgSimAC = avg(arr, (q) => safeNum(q.sim_ac, 0));
    const avgCE = avg(arr, (q) => safeNum(q.ce_multi_prob, 0));

    let v = 0,
      s1 = 0,
      failBoth = 0;

    for (const q of arr) {
      const cls = classifyScore(q, th);
      if (cls === "verified") v++;
      else if (cls === "entFail" || cls === "simFail") s1++; // giữ “fail 1 side”
      else failBoth++;
    }

    const verifiedPct = qaCount === 0 ? 0 : (v / qaCount) * 100;
    const step1OnlyPct = qaCount === 0 ? 0 : (s1 / qaCount) * 100;
    const failedPct = qaCount === 0 ? 0 : (failBoth / qaCount) * 100;

    return {
      language: L,
      qaCount,
      avgSimilarity: Number(((avgSimQC + avgSimAC) / 2).toFixed(3)),
      avgEntailment: Number(avgCE.toFixed(3)),
      verified: Number(verifiedPct.toFixed(1)),
      step1Only: Number(step1OnlyPct.toFixed(1)),
      failed: Number(failedPct.toFixed(1)),
    };
  });

  // 5) threshold curve data (score-based để thấy sensitivity rõ)
  const thresholds = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9];

  const thresholdData = thresholds.map((t) => {
    const tot = total || 1;

    const simPass = qas.filter((q) => {
      const sim_qc = safeNum(q.sim_qc, 0);
      const sim_ac = safeNum(q.sim_ac, 0);
      return sim_qc >= t && sim_ac >= t;
    }).length;

    const cePass = qas.filter((q) => safeNum(q.ce_multi_prob, 0) >= t).length;

    const bothPass = qas.filter((q) => classifyScore(q, t) === "verified").length;

    return {
      threshold: t,
      verified: Number(((bothPass / tot) * 100).toFixed(1)),
      similarity: Number(((simPass / tot) * 100).toFixed(1)),
      entailment: Number(((cePass / tot) * 100).toFixed(1)),
    };
  });

  const result = {
    modelId,
    name: meta.name,
    verification: meta.verification,

    // KPI row
    metrics: {
      total,
      passedSimilarity,
      passedEntailment,
      verified, // STRICT verified count
    },

    // charts
    chartData,
    pieData,
    thresholdData,
    errorDistribution,
    tableData,

    qualityThreshold: th,
    dataset,
    experiment,
  };

  MODEL_SECTION_CACHE.set(cacheKey, result);
  return result;
}

/**
 * Optional: clear caches nếu bạn muốn reload khi update JSON
 */
export function clearQAEvalCaches() {
  QA_CACHE.clear();
  MODEL_SECTION_CACHE.clear();
}