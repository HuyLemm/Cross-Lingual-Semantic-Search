import {
  countDocuments,
  loadTotalQAs,
  applyQualityFilter,
  applyFilters,
  computeFullMetrics,
  dedupeContent,
  normalizeModel,
  normalizeLang,
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
    search = "",
  } = query;

  /* =========================
   * 1. LOAD QA
   * ========================= */
  let qas = loadTotalQAs({ dataset, model, experiment });

  /* =========================
   * 2. REMOVE DUP CONTENT
   * ========================= */
  qas = dedupeContent(qas);

  /* =========================
   * 3. SEARCH FILTER
   * ========================= */
  if (search) {
    const s = search.toLowerCase();
    qas = qas.filter(
      (q) =>
        q.question?.toLowerCase().includes(s) ||
        q.answer?.toLowerCase().includes(s) ||
        q.source_pdf?.toLowerCase().includes(s),
    );
  }

  /* =========================
   * 4. SORT
   * MODEL → SOURCE → ORIGINAL QA_ID
   * ========================= */

  const MODEL_ORDER = {
    gpt: 1,
    gemini: 2,
    deepseek: 3,
  };

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

  /* =====================================================
   * 4.5 ZIP EN_i ↔ VI_i WHEN dataset = "all"
   * ===================================================== */

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
      if (i < en.length) mixed.push(en[i]); // EN_i
      if (i < vi.length) mixed.push(vi[i]); // VI_i
    }

    qas = mixed;
  }

  /* =========================
   * 5. PAGINATION
   * ========================= */
  const p = Number(page);
  const ps = Number(pageSize);
  const start = (p - 1) * ps;
  const pageItems = qas.slice(start, start + ps);

  /* =====================================================
   * 6. REINDEX QA_ID
   *
   * dataset = "all"  → EN_i & VI_i share index
   * dataset != "all" → normal increment
   * ===================================================== */

  let items = [];

  if (dataset === "all") {
    /* ===== PAIR MODE ===== */

    let pairIndex = Math.floor(start / 2);

    for (let i = 0; i < pageItems.length; i += 2) {
      pairIndex++;
      const indexStr = String(pairIndex).padStart(6, "0");

      const a = pageItems[i];
      const b = pageItems[i + 1];

      const pushItem = (q) => {
        if (!q) return;

        const modelNorm = normalizeModel(q.model);
        const langNorm = normalizeLang(q.language);

        items.push({
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
        });
      };

      pushItem(a);
      pushItem(b);
    }
  } else {
    /* ===== NORMAL MODE ===== */

    let counter = start;

    items = pageItems.map((q) => {
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
  }

  return {
    total: qas.length,
    page: p,
    pageSize: ps,
    items,
  };
}


export function buildDatasetOverview() {
  const MODELS = ["gpt", "gemini", "deepseek"];
  const LANGS = ["en", "vi"];
  const QUALITY = 0.7;

  const rows = [];

  for (const model of MODELS) {
    for (const lang of LANGS) {
      // 1. Load ALL EXP of this model + language
      let qas = loadTotalQAs({
        dataset: "all",
        model,
        experiment: "all",
      });

      // 2. Filter language
      qas = qas.filter((q) => q.language === lang);

      // 3. Remove duplicate content
      qas = dedupeContent(qas);

      // 4. Apply quality >= 0.7
      const verified = applyQualityFilter(qas, QUALITY);

      // ✔ QA PAIRS = VERIFIED QA
      const qaPairs = verified.length;

      // 5. Avg similarity (Bi encoder) on VERIFIED ONLY
      let avgBi = 0;
      let avgCE = 0;

      if (verified.length > 0) {
        avgBi =
          verified.reduce((s, q) => s + (q.sim_qc || 0), 0) / verified.length;

        avgCE =
          verified.reduce((s, q) => s + (q.ce_multi_prob || 0), 0) /
          verified.length;
      }

      rows.push({
        id: `${model}_${lang}`,

        name: `${model.toUpperCase()} ${lang.toUpperCase()}`,

        source: lang === "vi" ? "VJOL" : "SemanticScholar",
        language: lang.toUpperCase(),

        experiment: "all",
        model,

        qaPairs, // ✔ verified QA count

        avgBiEncoder: Number(avgBi.toFixed(3)),
        avgCrossEncoder: Number(avgCE.toFixed(3)),
      });
    }
  }

  return rows;
}
