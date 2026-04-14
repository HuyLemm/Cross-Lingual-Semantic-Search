import fs from "fs";
import path from "path";

import {
  resolveBaseDirLLM,
  safeReadText,
  inferMetaFromFilename,
  makeId,
  parseDatasetTotal,
  parseAccuracyTotal,
  parseLatency,
  avg,
  safeNum,
} from "../utils/getData.js";

/**
 * Build datasets for TabModelComparison
 *
 * Returns:
 * {
 *   generatedAt,
 *   baseDir,
 *   availableModels,
 *   facetedData,
 *   thresholdSensitivity,
 *   topKData,
 *   topKSummary,
 *   counts,
 *   warning?
 * }
 */
export async function getOption1ModelComparison(baseDirOverride) {
  const baseDir = resolveBaseDirLLM(baseDirOverride);

  if (!fs.existsSync(baseDir)) {
    return {
      generatedAt: new Date().toISOString(),
      baseDir,
      availableModels: [],
      facetedData: [],
      thresholdSensitivity: [],
      topKData: [],
      topKSummary: [],
      counts: { filesFound: 0, parsedConfigs: 0 },
      warning: `Directory not found: ${baseDir}`,
    };
  }

  const files = fs.readdirSync(baseDir).filter((f) => f.toLowerCase().endsWith(".txt"));

  /** @type {Array<{
   *   id: string,
   *   model: "DeepSeek"|"Gemini"|"GPT",
   *   language: "EN"|"VI",
   *   threshold: "Baseline"|"0.7"|"0.8"|"All QAs",
   *   datasetTotal: number,
   *   top1: number|null,
   *   top3: number|null,
   *   top5: number|null,
   *   top10: number|null,
   *   latencyAvgMs: number|null,
   *   sourceFile: string
   * }>}
   */
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
      latencyAvgMs: latency?.avgMs ?? null,
      sourceFile: f,
    });
  }

  configs.sort((a, b) => a.id.localeCompare(b.id));
  const availableModels = Array.from(new Set(configs.map((c) => c.model)));

  /* =========================================================
   * 4.1 facetedData (BarChart)
   * - TabModelComparison đang dùng: facetedData.filter(d => d.model===modelName)
   * - XAxis: threshold
   * - Tooltip: data.language, data.threshold, data.value
   * => mỗi row nên là: { model, language, threshold, value }
   * Value: Top-1 accuracy
   * ========================================================= */
  const facetedData = configs
    .filter((c) => c.top1 != null)
    .map((c) => ({
      model: c.model,
      language: c.language,
      threshold: c.threshold,
      value: safeNum(c.top1),
    }));

  /* =========================================================
   * 4.2 thresholdSensitivity (LineChart)
   * - Bạn đang plot Top-1 Accuracy theo threshold
   * - dataKey: "DeepSeek" | "Gemini" | "GPT"
   * - XAxis dataKey="threshold"
   *
   * Ta build 3 điểm: Baseline / 0.7 / 0.8
   * Nếu thiếu language nào -> average trên cái có.
   * ========================================================= */
  const thresholdAxis = ["Baseline", "0.7", "0.8"];

  const indexTop1 = new Map(); // key: model|lang|thr -> top1
  for (const c of configs) {
    if (c.top1 == null) continue;
    indexTop1.set(`${c.model}|${c.language}|${c.threshold}`, c.top1);
  }

  function top1Agg(model, threshold) {
    const en = indexTop1.get(`${model}|EN|${threshold}`);
    const vi = indexTop1.get(`${model}|VI|${threshold}`);
    const v = avg([en, vi].filter((x) => x != null));
    return safeNum(v);
  }

  const thresholdSensitivity = thresholdAxis.map((t) => ({
    threshold: t,
    DeepSeek: top1Agg("DeepSeek", t),
    Gemini: top1Agg("Gemini", t),
    GPT: top1Agg("GPT", t),
  }));

  /* =========================================================
   * 4.3 topKData (LineChart)
   * - XAxis dataKey="k" (1/3/5/10)
   * - dataKey: "DeepSeek" | "Gemini" | "GPT"
   * - Value: accuracy_total (avg across all configs)
   * ========================================================= */
  const models = ["DeepSeek", "Gemini", "GPT"];
  const ks = [1, 3, 5, 10];

  function avgMetric(model, metricKey) {
    const arr = configs.filter((c) => c.model === model).map((c) => c[metricKey]);
    const v = avg(arr);
    return safeNum(v);
  }

  const topKData = ks.map((k) => {
    const metricKey = k === 1 ? "top1" : k === 3 ? "top3" : k === 5 ? "top5" : "top10";
    return {
      k,
      DeepSeek: avgMetric("DeepSeek", metricKey),
      Gemini: avgMetric("Gemini", metricKey),
      GPT: avgMetric("GPT", metricKey),
    };
  });

  /* =========================================================
   * topKSummary (Table)
   * - rows: { model, top1, top3, top5, top10, gain }
   * - TabModelComparison format: topKSummary.map(row => row.model, row.top1...)
   * ========================================================= */
  const topKSummary = models.map((m) => {
    const top1m = avgMetric(m, "top1");
    const top3m = avgMetric(m, "top3");
    const top5m = avgMetric(m, "top5");
    const top10m = avgMetric(m, "top10");

    return {
      model: m,
      top1: top1m,
      top3: top3m,
      top5: top5m,
      top10: top10m,
      gain: safeNum(top10m - top1m),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    baseDir,
    availableModels,
    facetedData,
    thresholdSensitivity,
    topKData,
    topKSummary,
    counts: { filesFound: files.length, parsedConfigs: configs.length },
  };
}