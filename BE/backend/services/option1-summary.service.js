import fs from "fs";
import path from "path";

import {
  resolveBaseDirLLM,
  safeReadText,
  inferMetaFromFilename,
  makeId,
  formatConfigLabel,
  parseDatasetTotal,
  parseAccuracyTotal,
  parseLatency,
  pickBestBy,
  avg,
  safeNum as safeNumUtil,
} from "../utils/getData.js";

/* ============================= */
/*        MAIN FUNCTION          */
/* ============================= */

export async function getOption1Summary(baseDirOverride) {
  const baseDir = resolveBaseDirLLM(baseDirOverride);

  if (!fs.existsSync(baseDir)) {
    return {
      generatedAt: new Date().toISOString(),
      baseDir,
      availableModels: [],
      allConfigs: [],
      bestTop1: { value: null, config: null },
      bestTop3: { value: null, config: null },
      bestTop5: { value: null, config: null },
      bestTop10: { value: null, config: null },
      fastestLatency: { valueMs: null, config: null },
      radarData: [],
      warning: `Directory not found: ${baseDir}`,
    };
  }

  const files = fs
    .readdirSync(baseDir)
    .filter((f) => f.toLowerCase().endsWith(".txt"));

  const configs = [];

  for (const f of files) {
    const meta = inferMetaFromFilename(f);
    if (!meta) continue;

    const text = safeReadText(path.join(baseDir, f));

    const datasetTotal = parseDatasetTotal(text);
    const top1 = parseAccuracyTotal(text, 1);
    const top3 = parseAccuracyTotal(text, 3);
    const top5 = parseAccuracyTotal(text, 5);
    const top10 = parseAccuracyTotal(text, 10);
    const latency = parseLatency(text);

    if (!latency?.avgMs || latency.avgMs <= 0) {
      console.log("[LATENCY_MISSING]", f);
    }

    configs.push({
      id: makeId(meta),
      model: meta.model,
      language: meta.language,
      threshold: meta.threshold,
      datasetTotal,
      top1,
      top3,
      top5,
      top10,
      latency, // { avgMs }
      sourceFile: f,
    });
  }

  configs.sort((a, b) => a.id.localeCompare(b.id));
  const availableModels = Array.from(new Set(configs.map((c) => c.model)));

  // KPIs
  const { best: bestTop1Cfg, bestVal: bestTop1Val } = pickBestBy(configs, (c) => c.top1, "max");
  const { best: bestTop3Cfg, bestVal: bestTop3Val } = pickBestBy(configs, (c) => c.top3, "max");
  const { best: bestTop5Cfg, bestVal: bestTop5Val } = pickBestBy(configs, (c) => c.top5, "max");
  const { best: bestTop10Cfg, bestVal: bestTop10Val } = pickBestBy(configs, (c) => c.top10, "max");
  const { best: fastestCfg, bestVal: fastestVal } = pickBestBy(
    configs,
    (c) => c.latency?.avgMs,
    "min",
  );

  // Radar aggregation per model
  const models = ["DeepSeek", "Gemini", "GPT"];

  const modelMetrics = {
    DeepSeek: { top1: null, top3: null, top5: null, top10: null },
    Gemini: { top1: null, top3: null, top5: null, top10: null },
    GPT: { top1: null, top3: null, top5: null, top10: null },
  };

  const avgLatencyByModel = { DeepSeek: null, Gemini: null, GPT: null };

  for (const m of models) {
    const arr = configs.filter((c) => c.model === m);
    if (!arr.length) continue;

    modelMetrics[m] = {
      top1: avg(arr.map((x) => x.top1)),
      top3: avg(arr.map((x) => x.top3)),
      top5: avg(arr.map((x) => x.top5)),
      top10: avg(arr.map((x) => x.top10)),
    };

    avgLatencyByModel[m] = avg(arr.map((x) => x.latency?.avgMs));
  }

  // SpeedScore: minLatency / latency (fastest = 1)
  const latVals = models
    .map((m) => avgLatencyByModel[m])
    .filter((v) => v != null && v > 0);

  const minLatency = latVals.length ? Math.min(...latVals) : null;

  const speedScore = (lat) => {
    if (minLatency == null || lat == null || lat <= 0) return null;
    return minLatency / lat;
  };

  // ✅ sanitize to avoid recharts SVG path error
  const safeNum = (v) => safeNumUtil(v);

  const radarData = [
    {
      metric: "Top-1",
      DeepSeek: safeNum(modelMetrics.DeepSeek.top1),
      Gemini: safeNum(modelMetrics.Gemini.top1),
      GPT: safeNum(modelMetrics.GPT.top1),
    },
    {
      metric: "Top-3",
      DeepSeek: safeNum(modelMetrics.DeepSeek.top3),
      Gemini: safeNum(modelMetrics.Gemini.top3),
      GPT: safeNum(modelMetrics.GPT.top3),
    },
    {
      metric: "Top-5",
      DeepSeek: safeNum(modelMetrics.DeepSeek.top5),
      Gemini: safeNum(modelMetrics.Gemini.top5),
      GPT: safeNum(modelMetrics.GPT.top5),
    },
    {
      metric: "Top-10",
      DeepSeek: safeNum(modelMetrics.DeepSeek.top10),
      Gemini: safeNum(modelMetrics.Gemini.top10),
      GPT: safeNum(modelMetrics.GPT.top10),
    },
    {
      metric: "Speed",
      DeepSeek: safeNum(speedScore(avgLatencyByModel.DeepSeek)),
      Gemini: safeNum(speedScore(avgLatencyByModel.Gemini)),
      GPT: safeNum(speedScore(avgLatencyByModel.GPT)),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    baseDir,
    availableModels,

    allConfigs: configs.map((c) => ({
      id: c.id,
      model: c.model,
      language: c.language,
      threshold: c.threshold,
      top1: c.top1,
      top3: c.top3,
      top5: c.top5,
      top10: c.top10,
      latency: c.latency?.avgMs ?? 0,
      datasetTotal: c.datasetTotal,
    })),

    bestTop1: {
      value: bestTop1Val,
      config: bestTop1Cfg ? formatConfigLabel(bestTop1Cfg) : null,
    },
    bestTop3: {
      value: bestTop3Val,
      config: bestTop3Cfg ? formatConfigLabel(bestTop3Cfg) : null,
    },
    bestTop5: {
      value: bestTop5Val,
      config: bestTop5Cfg ? formatConfigLabel(bestTop5Cfg) : null,
    },
    bestTop10: {
      value: bestTop10Val,
      config: bestTop10Cfg ? formatConfigLabel(bestTop10Cfg) : null,
    },
    fastestLatency: {
      valueMs: fastestVal,
      config: fastestCfg ? formatConfigLabel(fastestCfg) : null,
    },

    radarData,
  };
}