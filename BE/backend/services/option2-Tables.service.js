import fs from "fs";
import path from "path";

import {
  resolveBaseDirBGE,
  inferMetaFromFilename,
  safeReadText,
  parseAccuracyTotal,
  parseNumberAfterLabel, // ✅ bạn nhớ export cái này trong utils/getData.js
} from "../utils/getData.js";

/* ============================= */
/*        EXTRA PARSERS          */
/* ============================= */

// Latency block: Avg / P50 / P90 / P95
function parseLatencyStats(text) {
  const avgMs = parseNumberAfterLabel(
    text,
    /Latency\s*\(ms\):[\s\S]*?\n\s*Avg\s*:\s*([0-9.]+)/i,
  );

  const p50Ms = parseNumberAfterLabel(
    text,
    /Latency\s*\(ms\):[\s\S]*?\n\s*P50\s*:\s*([0-9.]+)/i,
  );

  const p90Ms = parseNumberAfterLabel(
    text,
    /Latency\s*\(ms\):[\s\S]*?\n\s*P90\s*:\s*([0-9.]+)/i,
  );

  const p95Ms = parseNumberAfterLabel(
    text,
    /Latency\s*\(ms\):[\s\S]*?\n\s*P95\s*:\s*([0-9.]+)/i,
  );

  return {
    avgMs: avgMs ?? null,
    p50Ms: p50Ms ?? null,
    p90Ms: p90Ms ?? null,
    p95Ms: p95Ms ?? null,
  };
}

function parseThroughputQps(text) {
  const qps = parseNumberAfterLabel(
    text,
    /Throughput\s*\(queries\/s\)\s*:\s*([0-9.]+)/i,
  );
  return qps ?? null;
}

function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function safeNum(v, fallback = null) {
  return isFiniteNumber(v) ? v : fallback;
}

/* ============================= */
/*        MAIN FUNCTION          */
/* ============================= */

export async function getOption2TablesSummary({ baseDirOverride } = {}) {
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

  const rows = [];

  for (const f of files) {
    const meta = inferMetaFromFilename(f);
    if (!meta) continue;

    const text = safeReadText(path.join(baseDir, f));

    // Accuracy_total for each Top-k
    const top1 = safeNum(parseAccuracyTotal(text, 1));
    const top3 = safeNum(parseAccuracyTotal(text, 3));
    const top5 = safeNum(parseAccuracyTotal(text, 5));
    const top10 = safeNum(parseAccuracyTotal(text, 10));

    const lat = parseLatencyStats(text);
    const throughputQps = safeNum(parseThroughputQps(text));

    // skip if missing core values (tùy bạn muốn strict hay not)
    if (!isFiniteNumber(top1) || !isFiniteNumber(top10)) continue;

    rows.push({
      model: meta.model, // DeepSeek/Gemini/GPT
      language: meta.language, // EN/VI
      threshold: meta.threshold, // 0.7/0.8/All QAs

      top1,
      top3,
      top5,
      top10,

      latencyAvgMs: safeNum(lat.avgMs),
      latencyP50Ms: safeNum(lat.p50Ms),
      latencyP90Ms: safeNum(lat.p90Ms),
      latencyP95Ms: safeNum(lat.p95Ms),

      throughputQps,

      sourceFile: f,
    });
  }

  // sort stable for table
  const MODEL_ORDER = { DeepSeek: 1, Gemini: 2, GPT: 3 };
  const LANG_ORDER = { EN: 1, VI: 2 };
  const TH_ORDER = { "0.7": 1, "0.8": 2, "All QAs": 3 };

  rows.sort((a, b) => {
    const dm = (MODEL_ORDER[a.model] ?? 9) - (MODEL_ORDER[b.model] ?? 9);
    if (dm) return dm;

    const dl = (LANG_ORDER[a.language] ?? 9) - (LANG_ORDER[b.language] ?? 9);
    if (dl) return dl;

    return (TH_ORDER[a.threshold] ?? 9) - (TH_ORDER[b.threshold] ?? 9);
  });

  return {
    generatedAt: new Date().toISOString(),
    baseDir,
    rows,
    counts: { filesFound: files.length, parsedConfigs: rows.length },
  };
}