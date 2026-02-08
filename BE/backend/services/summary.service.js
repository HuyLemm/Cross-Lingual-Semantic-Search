import {
  countDocuments,
  loadTotalQAs,
  applyQualityFilter,
  applyFilters,
  computeFullMetrics,
  dedupeContent,
} from "../utils/utils.js";

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

  // 1. Load
  let qas = loadTotalQAs({ dataset, model, experiment });

  // 2. Dedupe
  qas = dedupeContent(qas);

  // TOTAL QA (sau exp + dedupe, chưa quality)
  const totalQAPairs = qas.length;

  // VERIFIED theo quality
  const verifiedQAs = applyQualityFilter(qas, quality);
  const verifiedQAPairs = verifiedQAs.length;

  // =========================
  // METRICS (REACTIVE)
  // =========================

  // Validation rate (reactive theo quality)
  const validationRate =
    totalQAPairs === 0
      ? 0
      : Number(((verifiedQAPairs / totalQAPairs) * 100).toFixed(1));

  // Avg scores (trên verified)
  let avgBiEncoder = 0;
  let avgCrossEncoder = 0;

  if (verifiedQAPairs > 0) {
    const sumBi = verifiedQAs.reduce((s, q) => s + (q.sim_qc || 0), 0);
    const sumCE = verifiedQAs.reduce((s, q) => s + (q.ce_multi_prob || 0), 0);

    avgBiEncoder = Number((sumBi / verifiedQAPairs).toFixed(3));
    avgCrossEncoder = Number((sumCE / verifiedQAPairs).toFixed(3));
  }

  // Step1-only rate (reactive)
  const step1OnlyCount = qas.filter(
    (q) =>
      q.verified === true &&
      q.verified_step2 !== true &&
      (q.sim_qc ?? 0) >= Number(quality || 0.7),
  ).length;

  const step1OnlyRate =
    totalQAPairs === 0
      ? 0
      : Number(((step1OnlyCount / totalQAPairs) * 100).toFixed(1));

  const totalDocuments = countDocuments({ dataset });

  return {
    totalDocuments,
    totalQAPairs,
    verifiedQAPairs,
    avgBiEncoder,
    avgCrossEncoder,
    validationRate,
    step1OnlyRate,
  };
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
    quality = "all",
    search = "",
  } = query;

  // 1. Load QA
  let qas = loadTotalQAs({ dataset, model, experiment });

  // 🔹 DEDUPE CONTENT
  qas = dedupeContent(qas);

  // 2. QUALITY
  qas = applyQualityFilter(qas, quality);

  // 3. SEARCH
  qas = applyFilters(qas, { search });

  // 4. Pagination
  const p = Number(page);
  const ps = Number(pageSize);
  const start = (p - 1) * ps;

  return {
    total: qas.length,
    page: p,
    pageSize: ps,
    items: qas.slice(start, start + ps),
  };
}


export function buildDatasetOverview(query) {
  const {
    dataset = "all",
    model = "all",
    experiment = "all",
    quality = "0.7",
  } = query;

  // 1. Load QA theo filter
  let qas = loadTotalQAs({ dataset, model, experiment });

  // 2. Remove duplicate content
  qas = dedupeContent(qas);

  // 3. Apply quality threshold
  const verified = applyQualityFilter(qas, quality);

  // =========================
  // GROUP BY DATASET
  // =========================

  const result = [];

  function buildRow(name, lang, source) {
    const list = qas.filter(q => q.language === lang);
    const verifiedList = verified.filter(q => q.language === lang);

    const qaPairs = list.length;

    const avgSim =
      verifiedList.length === 0
        ? 0
        : verifiedList.reduce((s, q) => s + (q.sim_qc || 0), 0) /
          verifiedList.length;

    return {
      id: source.toLowerCase(),
      name,
      language: lang,
      source,
      qaPairs,
      avgSimilarity: Number(avgSim.toFixed(2)),
      validationStatus: verifiedList.length > 0 ? "Verified" : "Pending",
    };
  }

  // Semantic Scholar (EN)
  if (dataset === "all" || dataset === "semantic_scholar") {
    result.push(
      buildRow(
        "Semantic Scholar Papers",
        "en",
        "Semantic Scholar"
      )
    );
  }

  // VJOL (VI)
  if (dataset === "all" || dataset === "vjol") {
    result.push(
      buildRow(
        "Vietnamese Research Papers",
        "vi",
        "VJOL"
      )
    );
  }

  return result;
}