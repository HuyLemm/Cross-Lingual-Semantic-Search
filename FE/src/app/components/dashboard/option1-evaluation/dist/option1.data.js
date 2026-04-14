"use strict";
exports.__esModule = true;
exports.facetedData = exports.errorCategories = exports.scatterDataByModel = exports.topKSummary = exports.topKData = exports.languageComparison = exports.thresholdSensitivity = exports.radarData = exports.highestThroughput = exports.fastestLatency = exports.bestNDCG = exports.bestMRR = exports.bestTop10 = exports.bestTop5 = exports.bestTop3 = exports.bestTop1 = exports.allConfigs = void 0;
/** ===== Mock Data: 18 configurations (3 models × 2 languages × 3 thresholds) ===== */
exports.allConfigs = [
    { model: "DeepSeek", language: "EN", threshold: "Baseline", datasetSize: 1250, top1: 0.847, top3: 0.912, top5: 0.945, top10: 0.968, mrr: 0.892, ndcg: 0.915, latency: 42, p95: 58, throughput: 23.8 },
    { model: "DeepSeek", language: "EN", threshold: "0.7", datasetSize: 1180, top1: 0.863, top3: 0.925, top5: 0.956, top10: 0.978, mrr: 0.907, ndcg: 0.928, latency: 38, p95: 52, throughput: 26.3 },
    { model: "DeepSeek", language: "EN", threshold: "0.8", datasetSize: 1050, top1: 0.881, top3: 0.941, top5: 0.968, top10: 0.987, mrr: 0.923, ndcg: 0.942, latency: 35, p95: 48, throughput: 28.5 },
    { model: "DeepSeek", language: "VI", threshold: "Baseline", datasetSize: 980, top1: 0.792, top3: 0.858, top5: 0.901, top10: 0.942, mrr: 0.838, ndcg: 0.872, latency: 45, p95: 62, throughput: 22.2 },
    { model: "DeepSeek", language: "VI", threshold: "0.7", datasetSize: 920, top1: 0.815, top3: 0.879, top5: 0.918, top10: 0.956, mrr: 0.858, ndcg: 0.891, latency: 41, p95: 57, throughput: 24.4 },
    { model: "DeepSeek", language: "VI", threshold: "0.8", datasetSize: 810, top1: 0.841, top3: 0.902, top5: 0.937, top10: 0.971, mrr: 0.879, ndcg: 0.911, latency: 37, p95: 51, throughput: 27.0 },
    { model: "Gemini", language: "EN", threshold: "Baseline", datasetSize: 1250, top1: 0.872, top3: 0.928, top5: 0.958, top10: 0.982, mrr: 0.912, ndcg: 0.935, latency: 38, p95: 53, throughput: 26.3 },
    { model: "Gemini", language: "EN", threshold: "0.7", datasetSize: 1180, top1: 0.891, top3: 0.945, top5: 0.971, top10: 0.991, mrr: 0.931, ndcg: 0.951, latency: 34, p95: 47, throughput: 29.4 },
    { model: "Gemini", language: "EN", threshold: "0.8", datasetSize: 1050, top1: 0.915, top3: 0.963, top5: 0.984, top10: 0.996, mrr: 0.951, ndcg: 0.969, latency: 31, p95: 43, throughput: 32.2 },
    { model: "Gemini", language: "VI", threshold: "Baseline", datasetSize: 980, top1: 0.823, top3: 0.885, top5: 0.924, top10: 0.961, mrr: 0.867, ndcg: 0.898, latency: 41, p95: 58, throughput: 24.4 },
    { model: "Gemini", language: "VI", threshold: "0.7", datasetSize: 920, top1: 0.849, top3: 0.908, top5: 0.943, top10: 0.976, mrr: 0.891, ndcg: 0.919, latency: 37, p95: 52, throughput: 27.0 },
    { model: "Gemini", language: "VI", threshold: "0.8", datasetSize: 810, top1: 0.878, top3: 0.934, top5: 0.961, top10: 0.988, mrr: 0.918, ndcg: 0.941, latency: 33, p95: 46, throughput: 30.3 },
    { model: "GPT", language: "EN", threshold: "Baseline", datasetSize: 1250, top1: 0.856, top3: 0.918, top5: 0.951, top10: 0.976, mrr: 0.901, ndcg: 0.925, latency: 52, p95: 71, throughput: 19.2 },
    { model: "GPT", language: "EN", threshold: "0.7", datasetSize: 1180, top1: 0.874, top3: 0.934, top5: 0.964, top10: 0.986, mrr: 0.918, ndcg: 0.941, latency: 48, p95: 66, throughput: 20.8 },
    { model: "GPT", language: "EN", threshold: "0.8", datasetSize: 1050, top1: 0.897, top3: 0.952, top5: 0.978, top10: 0.994, mrr: 0.938, ndcg: 0.959, latency: 44, p95: 60, throughput: 22.7 },
    { model: "GPT", language: "VI", threshold: "Baseline", datasetSize: 980, top1: 0.801, top3: 0.869, top5: 0.912, top10: 0.951, mrr: 0.848, ndcg: 0.883, latency: 56, p95: 77, throughput: 17.8 },
    { model: "GPT", language: "VI", threshold: "0.7", datasetSize: 920, top1: 0.827, top3: 0.893, top5: 0.931, top10: 0.967, mrr: 0.872, ndcg: 0.904, latency: 51, p95: 70, throughput: 19.6 },
    { model: "GPT", language: "VI", threshold: "0.8", datasetSize: 810, top1: 0.856, top3: 0.919, top5: 0.951, top10: 0.982, mrr: 0.899, ndcg: 0.928, latency: 46, p95: 63, throughput: 21.7 },
];
/** ===== Derived KPI values ===== */
exports.bestTop1 = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.top1; }));
exports.bestTop3 = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.top3; }));
exports.bestTop5 = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.top5; }));
exports.bestTop10 = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.top10; }));
exports.bestMRR = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.mrr; }));
exports.bestNDCG = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.ndcg; }));
exports.fastestLatency = Math.min.apply(Math, exports.allConfigs.map(function (c) { return c.latency; }));
exports.highestThroughput = Math.max.apply(Math, exports.allConfigs.map(function (c) { return c.throughput; }));
/** ===== Radar chart data ===== */
exports.radarData = [
    { metric: "Top-1", DeepSeek: 0.881, Gemini: 0.915, GPT: 0.897 },
    { metric: "Top-10", DeepSeek: 0.987, Gemini: 0.996, GPT: 0.994 },
    { metric: "MRR", DeepSeek: 0.923, Gemini: 0.951, GPT: 0.938 },
    { metric: "NDCG", DeepSeek: 0.942, Gemini: 0.969, GPT: 0.959 },
    { metric: "Speed", DeepSeek: 0.85, Gemini: 0.92, GPT: 0.68 },
    { metric: "Robustness", DeepSeek: 0.86, Gemini: 0.91, GPT: 0.84 },
];
/** ===== Threshold sensitivity ===== */
exports.thresholdSensitivity = [
    { threshold: "Baseline", DeepSeek: 0.847, Gemini: 0.872, GPT: 0.856 },
    { threshold: "0.7", DeepSeek: 0.863, Gemini: 0.891, GPT: 0.874 },
    { threshold: "0.8", DeepSeek: 0.881, Gemini: 0.915, GPT: 0.897 },
];
/** ===== Language comparison ===== */
exports.languageComparison = [
    { model: "DeepSeek", EN: 0.881, VI: 0.841 },
    { model: "Gemini", EN: 0.915, VI: 0.878 },
    { model: "GPT", EN: 0.897, VI: 0.856 },
];
/** ===== Top-K progression ===== */
exports.topKData = [
    { k: 1, DeepSeek: 0.881, Gemini: 0.915, GPT: 0.897 },
    { k: 3, DeepSeek: 0.941, Gemini: 0.963, GPT: 0.952 },
    { k: 5, DeepSeek: 0.968, Gemini: 0.984, GPT: 0.978 },
    { k: 10, DeepSeek: 0.987, Gemini: 0.996, GPT: 0.994 },
];
/** ===== Top-K summary table ===== */
exports.topKSummary = [
    { model: "DeepSeek", top1: 0.881, top3: 0.941, top5: 0.968, top10: 0.987, gain: 0.106 },
    { model: "Gemini", top1: 0.915, top3: 0.963, top5: 0.984, top10: 0.996, gain: 0.081 },
    { model: "GPT", top1: 0.897, top3: 0.952, top5: 0.978, top10: 0.994, gain: 0.097 },
];
/** ===== Scatter data: latency vs accuracy grouped by model ===== */
exports.scatterDataByModel = {
    DeepSeek: exports.allConfigs
        .filter(function (c) { return c.model === "DeepSeek"; })
        .map(function (c) { return ({ x: c.latency, y: c.top1, name: c.language + " " + c.threshold }); }),
    Gemini: exports.allConfigs
        .filter(function (c) { return c.model === "Gemini"; })
        .map(function (c) { return ({ x: c.latency, y: c.top1, name: c.language + " " + c.threshold }); }),
    GPT: exports.allConfigs
        .filter(function (c) { return c.model === "GPT"; })
        .map(function (c) { return ({ x: c.latency, y: c.top1, name: c.language + " " + c.threshold }); })
};
/** ===== Error categories ===== */
exports.errorCategories = [
    { name: "Semantic Mismatch", value: 42, color: "#ef4444" },
    { name: "Missing Context", value: 28, color: "#f59e0b" },
    { name: "Translation Error", value: 18, color: "#fbbf24" },
    { name: "Ranking Issue", value: 12, color: "#3b82f6" },
];
/** ===== Faceted data (Model-Level Comparison) ===== */
exports.facetedData = [
    // DeepSeek
    { model: "DeepSeek", language: "EN", threshold: "Baseline", value: 0.847 },
    { model: "DeepSeek", language: "EN", threshold: "0.7", value: 0.863 },
    { model: "DeepSeek", language: "EN", threshold: "0.8", value: 0.881 },
    { model: "DeepSeek", language: "VI", threshold: "Baseline", value: 0.792 },
    { model: "DeepSeek", language: "VI", threshold: "0.7", value: 0.815 },
    { model: "DeepSeek", language: "VI", threshold: "0.8", value: 0.841 },
    // Gemini
    { model: "Gemini", language: "EN", threshold: "Baseline", value: 0.872 },
    { model: "Gemini", language: "EN", threshold: "0.7", value: 0.891 },
    { model: "Gemini", language: "EN", threshold: "0.8", value: 0.915 },
    { model: "Gemini", language: "VI", threshold: "Baseline", value: 0.823 },
    { model: "Gemini", language: "VI", threshold: "0.7", value: 0.849 },
    { model: "Gemini", language: "VI", threshold: "0.8", value: 0.878 },
    // GPT
    { model: "GPT", language: "EN", threshold: "Baseline", value: 0.856 },
    { model: "GPT", language: "EN", threshold: "0.7", value: 0.874 },
    { model: "GPT", language: "EN", threshold: "0.8", value: 0.897 },
    { model: "GPT", language: "VI", threshold: "Baseline", value: 0.801 },
    { model: "GPT", language: "VI", threshold: "0.7", value: 0.827 },
    { model: "GPT", language: "VI", threshold: "0.8", value: 0.856 },
];
