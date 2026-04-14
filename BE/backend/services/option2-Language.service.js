import fs from "fs";
import path from "path";

import {
  resolveBaseDirBGE,
  inferMetaFromFilename,
  safeReadText,
  parseDatasetTotal,
  parseAccuracyTotal,
  parseLatency,
  avg,
} from "../utils/getData.js";

const MODELS = ["DeepSeek", "Gemini", "GPT"];
const MODEL_ORDER = { DeepSeek: 1, Gemini: 2, GPT: 3 };
const TH_ORDER = { "0.7": 1, "0.8": 2, "All QAs": 3 };

function safeNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function getOption2LanguageMatrix({ baseDirOverride } = {}) {
  const baseDir = resolveBaseDirBGE(baseDirOverride);

  if (!fs.existsSync(baseDir)) {
    return {
      generatedAt: new Date().toISOString(),
      baseDir,
      rows: [],
      counts: { filesFound: 0, parsedConfigs: 0 },
      warning: `Directory not found: ${baseDir}`,
    };
  }

  const files = fs
    .readdirSync(baseDir)
    .filter((f) => f.toLowerCase().endsWith(".txt"));

  const raw = [];

  for (const f of files) {
    const meta = inferMetaFromFilename(f);
    if (!meta) continue;

    const text = safeReadText(path.join(baseDir, f));

    raw.push({
      model: meta.model, // DeepSeek/Gemini/GPT
      language: meta.language, // EN/VI
      threshold: meta.threshold, // 0.7/0.8/All QAs
      datasetTotal: parseDatasetTotal(text),
      top1: safeNum(parseAccuracyTotal(text, 1)),
      top3: safeNum(parseAccuracyTotal(text, 3)),
      top5: safeNum(parseAccuracyTotal(text, 5)),
      top10: safeNum(parseAccuracyTotal(text, 10)),
      latencyMs: safeNum(parseLatency(text)?.avgMs) ?? 0,
      sourceFile: f,
    });
  }

  // group by (model, threshold, language) and average metrics
  const group = new Map(); // key: `${model}__${threshold}__${language}`

  for (const r of raw) {
    const key = `${r.model}__${r.threshold}__${r.language}`;
    if (!group.has(key)) group.set(key, []);
    group.get(key).push(r);
  }

  function avgMetric(arr, key) {
    const vals = arr.map((x) => x[key]).filter((v) => typeof v === "number" && Number.isFinite(v));
    return vals.length ? avg(vals) : null;
  }

  // collect all (model, threshold) pairs we have at least something for
  const pairSet = new Set();
  for (const r of raw) pairSet.add(`${r.model}__${r.threshold}`);

  const pairs = Array.from(pairSet).map((s) => {
    const [model, threshold] = s.split("__");
    return { model, threshold };
  });

  // build rows: one row = (model, threshold) with EN metrics + VI metrics
  const rows = pairs.map(({ model, threshold }) => {
    const enArr = group.get(`${model}__${threshold}__EN`) || [];
    const viArr = group.get(`${model}__${threshold}__VI`) || [];

    const EN = {
      top1: avgMetric(enArr, "top1"),
      top3: avgMetric(enArr, "top3"),
      top5: avgMetric(enArr, "top5"),
      top10: avgMetric(enArr, "top10"),
    };

    const VI = {
      top1: avgMetric(viArr, "top1"),
      top3: avgMetric(viArr, "top3"),
      top5: avgMetric(viArr, "top5"),
      top10: avgMetric(viArr, "top10"),
    };

    return {
      id: `${model}_${threshold}`,
      model,
      threshold,
      EN,
      VI,
    };
  });

  rows.sort((a, b) => {
    const dm = (MODEL_ORDER[a.model] ?? 999) - (MODEL_ORDER[b.model] ?? 999);
    if (dm) return dm;
    return (TH_ORDER[a.threshold] ?? 999) - (TH_ORDER[b.threshold] ?? 999);
  });

  const availableModels = Array.from(new Set(rows.map((r) => r.model)));

  return {
    generatedAt: new Date().toISOString(),
    baseDir,
    availableModels,
    rows,
    counts: { filesFound: files.length, parsedConfigs: raw.length },
  };
}