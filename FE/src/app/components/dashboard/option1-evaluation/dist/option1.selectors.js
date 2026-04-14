"use strict";
// option1-evaluation/option1.selectors.ts
exports.__esModule = true;
exports.scatterDataByModel = exports.highestThroughput = exports.fastestLatency = exports.bestNDCG = exports.bestMRR = exports.bestTop10 = exports.bestTop5 = exports.bestTop3 = exports.bestTop1 = void 0;
var option1_data_1 = require("./option1.data");
exports.bestTop1 = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.top1; }));
exports.bestTop3 = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.top3; }));
exports.bestTop5 = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.top5; }));
exports.bestTop10 = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.top10; }));
exports.bestMRR = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.mrr; }));
exports.bestNDCG = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.ndcg; }));
exports.fastestLatency = Math.min.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.latency; }));
exports.highestThroughput = Math.max.apply(Math, option1_data_1.allConfigs.map(function (c) { return c.throughput; }));
// ==============================
// Scatter Data (Latency vs Top1)
// ==============================
exports.scatterDataByModel = {
    DeepSeek: option1_data_1.allConfigs
        .filter(function (c) { return c.model === "DeepSeek"; })
        .map(function (c) { return ({
        x: c.latency,
        y: c.top1,
        name: c.language + " " + c.threshold
    }); }),
    Gemini: option1_data_1.allConfigs
        .filter(function (c) { return c.model === "Gemini"; })
        .map(function (c) { return ({
        x: c.latency,
        y: c.top1,
        name: c.language + " " + c.threshold
    }); }),
    GPT: option1_data_1.allConfigs
        .filter(function (c) { return c.model === "GPT"; })
        .map(function (c) { return ({
        x: c.latency,
        y: c.top1,
        name: c.language + " " + c.threshold
    }); })
};
