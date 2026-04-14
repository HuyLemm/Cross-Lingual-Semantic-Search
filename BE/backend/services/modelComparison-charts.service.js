import { readModelComparisonTxt, extractTableBlock, toNum } from "../utils/getDataFromTxt.js";

/**
 * Parse rows from TABLE 1..4
 */
function parseTable(lines) {
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("\t").map((x) => x.trim());

    if (parts.length < 7) continue;

    const [model, language, size, top1, top3, top5, top10] = parts;

    rows.push({
      model,
      language,
      datasetSize: toNum(size),
      top1: toNum(top1),
      top3: toNum(top3),
      top5: toNum(top5),
      top10: toNum(top10),
    });
  }

  return rows;
}

function getDatasetInfo(index) {
  switch (index) {
    case 1:
      return { dataset: "DeepSeek", tau: 0.7 };
    case 2:
      return { dataset: "DeepSeek", tau: 0.8 };
    case 3:
      return { dataset: "Gemini", tau: 0.7 };
    case 4:
      return { dataset: "Gemini", tau: 0.8 };
    default:
      return {};
  }
}

/**
 * Build recall chart
 */
function buildRecall(rows) {
  const baseline = rows.filter((r) => r.model.includes("MiniLM"));
  const advanced = rows.filter((r) => r.model.includes("BGE"));

  const avg = (arr, key) =>
    arr.reduce((a, b) => a + b[key], 0) / arr.length;

  return [
    {
      k: 1,
      baseline: avg(baseline, "top1"),
      advanced: avg(advanced, "top1"),
    },
    {
      k: 3,
      baseline: avg(baseline, "top3"),
      advanced: avg(advanced, "top3"),
    },
    {
      k: 5,
      baseline: avg(baseline, "top5"),
      advanced: avg(advanced, "top5"),
    },
    {
      k: 10,
      baseline: avg(baseline, "top10"),
      advanced: avg(advanced, "top10"),
    },
  ];
}

/**
 * Radar chart
 */
function buildRadar(rows) {
  const baseline = rows.filter((r) => r.model.includes("MiniLM"));
  const advanced = rows.filter((r) => r.model.includes("BGE"));

  const avg = (arr, key) =>
    arr.reduce((a, b) => a + b[key], 0) / arr.length;

  return [
    { metric: "Top-1", baseline: avg(baseline, "top1"), advanced: avg(advanced, "top1") },
    { metric: "Top-3", baseline: avg(baseline, "top3"), advanced: avg(advanced, "top3") },
    { metric: "Top-5", baseline: avg(baseline, "top5"), advanced: avg(advanced, "top5") },
    { metric: "Top-10", baseline: avg(baseline, "top10"), advanced: avg(advanced, "top10") },
  ];
}

/**
 * Language comparison
 */
function buildLanguage(rows) {
  const langs = ["EN", "VI"];

  return langs.map((lang) => {
    const b = rows.filter((r) => r.language === lang && r.model.includes("MiniLM"));
    const a = rows.filter((r) => r.language === lang && r.model.includes("BGE"));

    const avg = (arr) =>
      arr.reduce((x, y) => x + y.top10, 0) / arr.length;

    return {
      language: lang,
      baseline: avg(b),
      advanced: avg(a),
    };
  });
}

/**
 * Improvement categories
 */
function buildImprovement(rows) {
  const baseline = rows.filter((r) => r.model.includes("MiniLM"));
  const advanced = rows.filter((r) => r.model.includes("BGE"));

  const avg = (arr, key) =>
    arr.reduce((a, b) => a + b[key], 0) / arr.length;

  return [
    {
      category: "Top-1",
      baseline: avg(baseline, "top1"),
      advanced: avg(advanced, "top1"),
    },
    {
      category: "Top-3",
      baseline: avg(baseline, "top3"),
      advanced: avg(advanced, "top3"),
    },
    {
      category: "Top-5",
      baseline: avg(baseline, "top5"),
      advanced: avg(advanced, "top5"),
    },
    {
      category: "Top-10",
      baseline: avg(baseline, "top10"),
      advanced: avg(advanced, "top10"),
    },
  ];
}

/**
 * Tradeoff
 */
function buildTradeoff(rows) {
  const baseline = rows.filter((r) => r.model.includes("MiniLM"));
  const advanced = rows.filter((r) => r.model.includes("BGE"));

  const avg = (arr) =>
    arr.reduce((a, b) => a + b.top10, 0) / arr.length;

  return [
    {
      name: "Baseline",
      accuracy: avg(baseline),
      latency: 20,
      size: 500,
    },
    {
      name: "Advanced",
      accuracy: avg(advanced),
      latency: 40,
      size: 700,
    },
  ];
}

export function loadModelComparisonCharts(baseDirOverride) {
  const text = readModelComparisonTxt(baseDirOverride);

  let rows = [];

  for (let i = 1; i <= 4; i++) {
    const block = extractTableBlock(text, i);

    const parsed = parseTable(block);

    const meta = getDatasetInfo(i);

    parsed.forEach((r) => {
      rows.push({
        ...meta,
        ...r,
      });
    });
  }

  return {
    ok: true,
    recallComparison: buildRecall(rows),
    radarComparison: buildRadar(rows),
    perQueryComparison: [],
    improvementBreakdown: buildImprovement(rows),
    languagePerformance: buildLanguage(rows),
    tradeoffData: buildTradeoff(rows),
  };
}