import fs from "fs";
import path from "path";

import {
  resolveBaseDirBGE,
  inferMetaFromFilename,
  safeReadText,
  parseAccuracyTotal,
  parseLatency,
  avg,
} from "../utils/getData.js";

const MODELS = ["DeepSeek", "Gemini", "GPT"];
const MODEL_ORDER = { DeepSeek: 1, Gemini: 2, GPT: 3 };
const TH_ORDER = { "0.7": 1, "0.8": 2, "All QAs": 3 };
const LANG_ORDER = { EN: 1, VI: 2 };

function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function safeNum(v, fallback = null) {
  return isFiniteNumber(v) ? v : fallback;
}

function makePointName(c) {
  return `${c.model} ${c.language} ${c.threshold}`;
}

function normalizeMetricKey(metric) {
  const m = String(metric || "").toLowerCase().trim();
  if (m === "top3") return "top3";
  if (m === "top5") return "top5";
  if (m === "top10") return "top10";
  return "top1";
}

function metricK(metricKey) {
  return metricKey === "top3" ? 3 : metricKey === "top5" ? 5 : metricKey === "top10" ? 10 : 1;
}

function efficiencyScore(metricValue, latencyMs) {
  // Efficiency Score = (Top-k Accuracy) / (Latency ms) * 100
  if (!isFiniteNumber(metricValue) || !isFiniteNumber(latencyMs) || latencyMs <= 0) return null;
  return (metricValue / latencyMs) * 100;
}

/**
 * GET /evaluation/option1/latency?metric=top1|top3|top5|top10
 * - scatter y = selected metric
 * - table metricValue = selected metric
 */
export async function getOption2LatencySummary({ baseDirOverride, metric = "top1" } = {}) {
  const baseDir = resolveBaseDirBGE(baseDirOverride);
  const metricKey = normalizeMetricKey(metric);
  const k = metricK(metricKey);

  if (!fs.existsSync(baseDir)) {
    return {
      generatedAt: new Date().toISOString(),
      baseDir,
      metric: metricKey,
      scatterDataByModel: { DeepSeek: [], Gemini: [], GPT: [] },
      efficiencyTable: [],
      counts: { filesFound: 0, parsedConfigs: 0 },
      warning: `Directory not found: ${baseDir}`,
    };
  }

  const files = fs.readdirSync(baseDir).filter((f) => f.toLowerCase().endsWith(".txt"));
  const configs = [];

  for (const f of files) {
    const meta = inferMetaFromFilename(f);
    if (!meta) continue;

    const text = safeReadText(path.join(baseDir, f));

    // parse selected metric
    const metricVal = parseAccuracyTotal(text, k);
    const latency = parseLatency(text); // { avgMs }

    const mv = safeNum(metricVal);
    const latMs = safeNum(latency?.avgMs, 0);

    // skip if missing
    if (!isFiniteNumber(mv) || !isFiniteNumber(latMs) || latMs <= 0) continue;

    configs.push({
      model: meta.model,
      language: meta.language,
      threshold: meta.threshold,
      metricValue: mv, // ✅ selected Top-k
      latencyMs: latMs,
      sourceFile: f,
    });
  }

  // scatter points grouped by model
  const scatterDataByModel = { DeepSeek: [], Gemini: [], GPT: [] };

  for (const c of configs) {
    if (!scatterDataByModel[c.model]) continue;

    scatterDataByModel[c.model].push({
      x: Math.round(c.latencyMs),
      y: c.metricValue, // ✅ selected Top-k
      name: makePointName(c),
      model: c.model,
      language: c.language,
      threshold: c.threshold,
      sourceFile: c.sourceFile,
    });
  }

  // stable sort
  for (const m of MODELS) {
    scatterDataByModel[m].sort((a, b) => {
      const dLang = (LANG_ORDER[a.language] ?? 9) - (LANG_ORDER[b.language] ?? 9);
      if (dLang) return dLang;
      return (TH_ORDER[a.threshold] ?? 9) - (TH_ORDER[b.threshold] ?? 9);
    });
  }

  // efficiency table per model: avg latency + avg metricValue
  const efficiencyTable = MODELS.map((m) => {
    const arr = configs.filter((c) => c.model === m);

    const avgLat = avg(arr.map((x) => x.latencyMs).filter(isFiniteNumber));
    const avgMetric = avg(arr.map((x) => x.metricValue).filter(isFiniteNumber));
    const eff = efficiencyScore(avgMetric, avgLat);

    return {
      model: m,
      avgLatencyMs: avgLat ?? null,
      metricValue: avgMetric ?? null, // ✅ FE dùng row.metricValue
      efficiency: eff ?? null,
      n: arr.length,
    };
  })
    .filter((r) => r.n > 0)
    .sort((a, b) => (MODEL_ORDER[a.model] ?? 9) - (MODEL_ORDER[b.model] ?? 9))
    .map(({ n, ...rest }) => rest);

  return {
    generatedAt: new Date().toISOString(),
    baseDir,
    metric: metricKey,
    scatterDataByModel,
    efficiencyTable,
    counts: { filesFound: files.length, parsedConfigs: configs.length },
  };
}