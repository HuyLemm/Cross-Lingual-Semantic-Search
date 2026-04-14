import { readModelComparisonTxt, extractTableBlock, toNum } from "../utils/getDataFromTxt.js";

/**
 * Helpers
 */
function avg(nums) {
  const v = (nums || []).filter((n) => Number.isFinite(n));
  if (v.length === 0) return NaN;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function median(nums) {
  const v = (nums || []).filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (v.length === 0) return NaN;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function parseTable5(tableLines) {
  const clean = (tableLines || []).map((l) => l.trim()).filter(Boolean);
  if (clean.length < 2) return [];

  const out = [];

  for (let i = 1; i < clean.length; i++) {
    const parts = clean[i].split("\t").map((s) => s.trim());
    if (parts.length < 5) continue;

    const [datasetLabel, language, minilmStr, bgeStr, improvementStr] = parts;

    if (!(language === "EN" || language === "VI")) continue;

    const minilm = toNum(minilmStr);
    const bge = toNum(bgeStr);

    const m = String(improvementStr || "").match(/([+-]?\d+(?:\.\d+)?)\s*%/);
    const improvementPct = m ? toNum(m[1]) : NaN;

    if (![minilm, bge, improvementPct].every(Number.isFinite)) continue;

    out.push({
      datasetLabel,
      language,
      minilm,
      bge,
      improvementPct, 
    });
  }

  return out;
}

/**
 * Public: build SummaryCards data from model_comparison.txt
 */
export function loadModelComparisonSummary(baseDirOverride) {
  const text = readModelComparisonTxt(baseDirOverride);

  // Summary dựa trên TABLE 5 (Improvement %)
  const table5Lines = extractTableBlock(text, 5);
  const table5Rows = parseTable5(table5Lines);

  const improvements = table5Rows.map((r) => r.improvementPct);

  // Bạn đang dùng:
  // - Quality Gain: "Avg NDCG Improvement" (ở đây lấy avg Improvement% của TABLE 5)
  // - Reranker Boost: lấy median Improvement% (đỡ outlier)
  const qualityGainPct = avg(improvements);
  const rerankerBoostPct = median(improvements);

  // Latency không có trong txt hiện tại -> để "—"
  const speedCostMs = null;
  const efficiencyRatio =
    Number.isFinite(qualityGainPct) && speedCostMs && speedCostMs !== 0
      ? qualityGainPct / speedCostMs
      : null;

  const summaryCards = {
    qualityGainText: Number.isFinite(qualityGainPct) ? `+${qualityGainPct.toFixed(1)}%` : "—",
    speedCostText: speedCostMs != null ? `+${speedCostMs}ms` : "—",
    rerankerBoostText: Number.isFinite(rerankerBoostPct) ? `+${rerankerBoostPct.toFixed(1)}%` : "—",
    efficiencyRatioText: efficiencyRatio != null ? efficiencyRatio.toFixed(2) : "—",
  };

  return {
    summaryCards,
    table5Rows, // optional: để debug/hiển thị bảng improvement
  };
}