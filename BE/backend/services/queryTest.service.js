import fs from "fs";
import { getResultsQuerytypeBenchmarkPath } from "../utils/getDataFromJSON.js";

/**
 * Heuristic detect language from query string
 * (fallback only)
 */
function detectLanguage(query) {
  const s = String(query || "");
  const viRegex =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return viRegex.test(s) ? "VI" : "EN";
}

/**
 * Prefer input_lang from file 2 if available
 */
function normalizeLanguage(inputLang, query) {
  const s = String(inputLang || "").trim().toLowerCase();
  if (s === "vi") return "VI";
  if (s === "en") return "EN";
  return detectLanguage(query);
}

/**
 * Normalize usecase label to match your taxonomy
 */
function normalizeUsecase(raw) {
  const s = String(raw || "").trim().toLowerCase();

  const rules = [
    [/^single\s*word$/, "Single word"],
    [/^one\s*word$/, "Single word"],
    [/^1\s*từ$/, "Single word"],

    [/^two\s*words$/, "Two words"],
    [/^2\s*từ$/, "Two words"],

    [/^phrase$/, "Phrase"],
    [/^cụm\s*từ$/, "Phrase"],

    [/^multi[-\s]*keyword$/, "Multi-keyword"],
    [/^nhiều\s*từ\s*khóa$/, "Multi-keyword"],

    [/^statement$/, "Statement"],
    [/^câu\s*khẳng\s*định$/, "Statement"],

    [/^negative\s*statement$/, "Negative statement"],
    [/^câu\s*phủ\s*định$/, "Negative statement"],

    [/^question$/, "Question"],
    [/^câu\s*hỏi$/, "Question"],

    [/^how\s*question$/, "Question (How)"],
    [/^why\s*question$/, "Question (Why)"],
    [/question\s*how$/, "Question (How)"],
    [/question\s*why$/, "Question (Why)"],
    [/^how$/, "Question (How)"],
    [/^why$/, "Question (Why)"],

    [/^long\s*query$/, "Long query"],
    [/^câu\s*dài$/, "Long query"],

    [/^keyword\s*style$/, "Keyword style"],
    [/^query\s*dạng\s*từ\s*khóa$/, "Keyword style"],

    [/^noisy\s*query$/, "Noisy query"],
    [/^query\s*nhiễu$/, "Noisy query"],

    [/^paraphrase$/, "Paraphrase"],
    [/^diễn\s*đạt\s*khác$/, "Paraphrase"],

    [/^synonym$/, "Synonym"],
    [/^đồng\s*nghĩa$/, "Synonym"],

    [/^cross[-\s]*language\s*query$/, "Cross-language query"],
    [/^cross[-\s]*language$/, "Cross-language query"],
  ];

  for (const [re, label] of rules) {
    if (re.test(s)) return label;
  }
  return raw || "Unknown";
}

/**
 * Find best rank within top_candidates that passes threshold
 * File 2 dùng reranked_rank, fallback sang rank nếu có
 * return 999 if no pass
 */
function computeRank(topCandidates, threshold) {
  if (!Array.isArray(topCandidates) || topCandidates.length === 0) return 999;

  const hit = topCandidates.find(
    (c) => typeof c?.score === "number" && c.score >= threshold
  );
  if (!hit) return 999;

  if (typeof hit.reranked_rank === "number") return hit.reranked_rank;
  if (typeof hit.rank === "number") return hit.rank;

  return 999;
}

function computeStatus({ hit10, rank, top1Score, threshold }) {
  if (!hit10) return "failed";
  if (top1Score < threshold) return "partial";
  if (rank > 1) return "partial";
  return "success";
}

/**
 * Build distribution helper
 */
function buildDistribution(values, bins) {
  const out = bins.map((b) => ({ range: b.label, count: 0 }));

  for (const v of values) {
    for (let i = 0; i < bins.length; i++) {
      const b = bins[i];
      const isLast = i === bins.length - 1;

      if ((v >= b.min && v < b.max) || (isLast && v >= b.min && v <= b.max)) {
        out[i].count += 1;
        break;
      }
    }
  }

  return out;
}

/**
 * Main: load results_querytype_benchmark.json -> return FULL per-query objects
 */
export function loadQueryTestResults(baseDirOverride) {
  const p = getResultsQuerytypeBenchmarkPath(baseDirOverride);

  if (!p) {
    return {
      ok: false,
      error: "results_querytype_benchmark.json not found",
      rows: [],
    };
  }

  const raw = fs.readFileSync(p, "utf-8");
  const json = JSON.parse(raw);

  const threshold =
    typeof json.TRUE_THRESHOLD === "number" ? json.TRUE_THRESHOLD : 0.7;

  // file 2 dùng runs
  const runs = Array.isArray(json.runs) ? json.runs : [];

  const rows = runs.map((c, idx) => {
    const query = String(c.query ?? "");
    const language = normalizeLanguage(c.input_lang, query);
    const type = normalizeUsecase(String(c.usecase ?? "Unknown"));
    const engine = String(c.engine ?? "UNKNOWN");

    const hit10 = typeof c["hit@10"] === "number" ? c["hit@10"] : 0;
    const top1Score = typeof c.top1_score === "number" ? c.top1_score : 0;

    const rankRaw = computeRank(c.top_candidates, threshold);
    const rank =
      rankRaw === 999
        ? (typeof c.num_results === "number" ? c.num_results : 30) + 1
        : rankRaw;

    const recall10 = hit10 ? 1 : 0;
    const mrr = hit10 && rankRaw !== 999 ? 1 / rankRaw : 0;

    const status = computeStatus({
      hit10,
      rank: rankRaw,
      top1Score,
      threshold,
    });

    return {
      ...c,

      // normalized fields cho FE
      id: String(c.id ?? `${engine}-${language}-${idx + 1}`),
      type,
      language,
      engine,

      topDoc: String(c.top1_title ?? ""),
      similarity: top1Score,
      recall10,
      mrr,
      rank,
      status,

      // alias để FE cũ vẫn dùng được
      expected: String(c.expected_terms ?? ""),
      expected_context: String(c.expected_terms ?? ""),

      // optional aliases
      inputLang: String(c.input_lang ?? ""),
      topDocLang: String(c.top1_detected_lang ?? ""),
    };
  });

  const byType = {};
  for (const r of rows) {
    const k = r.type || "Unknown";
    if (!byType[k]) {
      byType[k] = {
        count: 0,
        sumSim: 0,
        sumSuccess: 0,
        sumRecall10: 0,
      };
    }

    byType[k].count += 1;
    byType[k].sumSim += Number(r.similarity || 0);
    byType[k].sumSuccess += r.status === "success" ? 1 : 0;
    byType[k].sumRecall10 += Number(r.recall10 || 0);
  }

  const queryTypeData = Object.entries(byType).map(([type, v]) => ({
    type,
    count: v.count,
    avgSimilarity: v.count ? v.sumSim / v.count : 0,
    successRate: v.count ? v.sumSuccess / v.count : 0,
    recall10: v.count ? v.sumRecall10 / v.count : 0,
  }));

  const byLang = {
    EN: { c: 0, r10: 0, mrr: 0 },
    VI: { c: 0, r10: 0, mrr: 0 },
  };

  for (const r of rows) {
    const L = r.language === "VI" ? "VI" : "EN";
    byLang[L].c += 1;
    byLang[L].r10 += Number(r.recall10 || 0);
    byLang[L].mrr += Number(r.mrr || 0);
  }

  const languageData = [
    {
      language: "English",
      recall10: byLang.EN.c ? byLang.EN.r10 / byLang.EN.c : 0,
      mrr: byLang.EN.c ? byLang.EN.mrr / byLang.EN.c : 0,
    },
    {
      language: "Vietnamese",
      recall10: byLang.VI.c ? byLang.VI.r10 / byLang.VI.c : 0,
      mrr: byLang.VI.c ? byLang.VI.mrr / byLang.VI.c : 0,
    },
  ];

  const ks =
    Array.isArray(json.K_VALUES) && json.K_VALUES.length
      ? json.K_VALUES
      : [1, 3, 5, 10];

  const recallAtK = ks.map((k) => {
    const key = `hit@${k}`;
    let hitSum = 0;

    for (const r of rows) {
      hitSum += Number(r[key] || 0);
    }

    return {
      k,
      recall: rows.length ? hitSum / rows.length : 0,
    };
  });

  const mrrValues = rows.map((r) => Number(r.mrr || 0));
  const simValues = rows.map((r) => Number(r.similarity || 0));

  const mrrDistribution = buildDistribution(mrrValues, [
    { min: 0.0, max: 0.2, label: "0.0-0.2" },
    { min: 0.2, max: 0.4, label: "0.2-0.4" },
    { min: 0.4, max: 0.6, label: "0.4-0.6" },
    { min: 0.6, max: 0.8, label: "0.6-0.8" },
    { min: 0.8, max: 1.0, label: "0.8-1.0" },
  ]);

  const similarityDistribution = buildDistribution(simValues, [
    { min: 0.0, max: 0.5, label: "0.0-0.5" },
    { min: 0.5, max: 0.6, label: "0.5-0.6" },
    { min: 0.6, max: 0.7, label: "0.6-0.7" },
    { min: 0.7, max: 0.8, label: "0.7-0.8" },
    { min: 0.8, max: 0.9, label: "0.8-0.9" },
    { min: 0.9, max: 1.0, label: "0.9-1.0" },
  ]);

  const failedQueries = rows
    .filter((r) => r.status === "failed")
    .map((r) => ({
      query: r.query,
      type: r.type,
      language: r.language,
      expected: r.expected_terms || r.expected_context || "",
      rank: r.rank,
      similarity: r.similarity,
      errorType: "Unknown",
    }));

  const availableTypes = Array.from(
    new Set(rows.map((r) => r.type).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return {
    ok: true,
    rows,
    queryTypeData,
    languageData,
    recallAtK,
    mrrDistribution,
    similarityDistribution,
    failedQueries,
    meta: {
      threshold,
      file: p,
      total: rows.length,
      engines: json.engines || [],
      kValues: ks,
      retrievalTopK: json.retrieval_top_k || 30,
      availableTypes,
    },
  };
}