"use strict";
// app/(whatever)/qa-eval/data/qaEvalData.ts
exports.__esModule = true;
exports.radarComparisonData = exports.crossModelComparison = exports.modelData = void 0;
exports.modelData = {
    "gpt-5.2": {
        name: "GPT-5.2",
        verification: "Bi + Cross",
        metrics: {
            total: 1250,
            passedSimilarity: 1180,
            passedEntailment: 1145,
            verified: 1120
        },
        chartData: [
            { language: "EN", similarity: 0.912, entailment: 0.889, verifiedRatio: 0.896 },
            { language: "VI", similarity: 0.854, entailment: 0.821, verifiedRatio: 0.832 },
        ],
        pieData: [
            { name: "Verified", value: 1120, color: "#a855f7" },
            { name: "Step1 Only", value: 60, color: "#3b82f6" },
            { name: "Step2 Only", value: 25, color: "#10b981" },
            { name: "Failed Both", value: 45, color: "#ef4444" },
        ],
        thresholdData: [
            { threshold: 0.6, verified: 95.2, similarity: 97.1, entailment: 96.3 },
            { threshold: 0.65, verified: 93.8, similarity: 95.8, entailment: 94.9 },
            { threshold: 0.7, verified: 91.5, similarity: 94.2, entailment: 93.1 },
            { threshold: 0.75, verified: 88.7, similarity: 91.8, entailment: 90.5 },
            { threshold: 0.8, verified: 84.3, similarity: 88.4, entailment: 86.9 },
            { threshold: 0.85, verified: 78.1, similarity: 82.7, entailment: 81.2 },
            { threshold: 0.9, verified: 68.9, similarity: 73.5, entailment: 72.1 },
        ],
        errorDistribution: [
            { language: "EN", verified: 672, simFail: 35, entFail: 28, bothFail: 15 },
            { language: "VI", verified: 448, simFail: 25, entFail: 17, bothFail: 10 },
        ],
        tableData: [
            { language: "EN", qaCount: 750, avgSimilarity: 0.912, avgEntailment: 0.889, verified: 89.6, step1Only: 4.7, failed: 5.7 },
            { language: "VI", qaCount: 500, avgSimilarity: 0.854, avgEntailment: 0.821, verified: 89.6, step1Only: 5.0, failed: 5.4 },
        ]
    },
    "gemini-2.5": {
        name: "Gemini 2.5 Flash",
        verification: "Cross only",
        metrics: {
            total: 1180,
            passedSimilarity: 1095,
            passedEntailment: 1062,
            verified: 1038
        },
        chartData: [
            { language: "EN", similarity: 0.935, entailment: 0.908, verifiedRatio: 0.912 },
            { language: "VI", similarity: 0.881, entailment: 0.856, verifiedRatio: 0.864 },
        ],
        pieData: [
            { name: "Verified", value: 1038, color: "#a855f7" },
            { name: "Step1 Only", value: 57, color: "#3b82f6" },
            { name: "Step2 Only", value: 24, color: "#10b981" },
            { name: "Failed Both", value: 61, color: "#ef4444" },
        ],
        thresholdData: [
            { threshold: 0.6, verified: 96.8, similarity: 98.3, entailment: 97.5 },
            { threshold: 0.65, verified: 95.1, similarity: 96.9, entailment: 95.8 },
            { threshold: 0.7, verified: 93.2, similarity: 95.1, entailment: 94.2 },
            { threshold: 0.75, verified: 90.8, similarity: 93.2, entailment: 91.9 },
            { threshold: 0.8, verified: 87.3, similarity: 90.5, entailment: 88.7 },
            { threshold: 0.85, verified: 81.5, similarity: 85.2, entailment: 83.8 },
            { threshold: 0.9, verified: 72.1, similarity: 76.8, entailment: 74.5 },
        ],
        errorDistribution: [
            { language: "EN", verified: 592, simFail: 28, entFail: 22, bothFail: 7 },
            { language: "VI", verified: 446, simFail: 29, entFail: 32, bothFail: 24 },
        ],
        tableData: [
            { language: "EN", qaCount: 649, avgSimilarity: 0.935, avgEntailment: 0.908, verified: 91.2, step1Only: 4.3, failed: 4.5 },
            { language: "VI", qaCount: 531, avgSimilarity: 0.881, avgEntailment: 0.856, verified: 84.0, step1Only: 5.5, failed: 10.5 },
        ]
    },
    "deepseek-r1t2": {
        name: "DeepSeek R1T2",
        verification: "Bi + Cross",
        metrics: {
            total: 1320,
            passedSimilarity: 1218,
            passedEntailment: 1171,
            verified: 1145
        },
        chartData: [
            { language: "EN", similarity: 0.945, entailment: 0.923, verifiedRatio: 0.928 },
            { language: "VI", similarity: 0.897, entailment: 0.869, verifiedRatio: 0.876 },
        ],
        pieData: [
            { name: "Verified", value: 1145, color: "#a855f7" },
            { name: "Step1 Only", value: 73, color: "#3b82f6" },
            { name: "Step2 Only", value: 26, color: "#10b981" },
            { name: "Failed Both", value: 76, color: "#ef4444" },
        ],
        thresholdData: [
            { threshold: 0.6, verified: 97.5, similarity: 98.9, entailment: 98.2 },
            { threshold: 0.65, verified: 96.2, similarity: 97.8, entailment: 96.9 },
            { threshold: 0.7, verified: 94.8, similarity: 96.5, entailment: 95.4 },
            { threshold: 0.75, verified: 92.7, similarity: 94.8, entailment: 93.5 },
            { threshold: 0.8, verified: 89.5, similarity: 92.1, entailment: 90.8 },
            { threshold: 0.85, verified: 84.3, similarity: 87.9, entailment: 86.2 },
            { threshold: 0.9, verified: 75.8, similarity: 80.2, entailment: 78.6 },
        ],
        errorDistribution: [
            { language: "EN", verified: 636, simFail: 22, entFail: 18, bothFail: 10 },
            { language: "VI", verified: 509, simFail: 51, entFail: 28, bothFail: 46 },
        ],
        tableData: [
            { language: "EN", qaCount: 686, avgSimilarity: 0.945, avgEntailment: 0.923, verified: 92.7, step1Only: 3.2, failed: 4.1 },
            { language: "VI", qaCount: 634, avgSimilarity: 0.897, avgEntailment: 0.869, verified: 80.3, step1Only: 8.0, failed: 11.7 },
        ]
    }
};
exports.crossModelComparison = [
    { model: "GPT-5.2", totalQA: 1250, avgSimilarity: 0.883, avgEntailment: 0.855, verified: 89.6, enVerified: 89.6, viVerified: 89.6 },
    { model: "Gemini 2.5", totalQA: 1180, avgSimilarity: 0.908, avgEntailment: 0.882, verified: 88.0, enVerified: 91.2, viVerified: 84.0 },
    { model: "DeepSeek R1T2", totalQA: 1320, avgSimilarity: 0.921, avgEntailment: 0.896, verified: 86.7, enVerified: 92.7, viVerified: 80.3 },
];
exports.radarComparisonData = [
    { metric: "Avg Similarity", "GPT-5.2": 0.883, "Gemini 2.5": 0.908, "DeepSeek R1T2": 0.921 },
    { metric: "Avg Entailment", "GPT-5.2": 0.855, "Gemini 2.5": 0.882, "DeepSeek R1T2": 0.896 },
    { metric: "Verified %", "GPT-5.2": 0.896, "Gemini 2.5": 0.88, "DeepSeek R1T2": 0.867 },
    { metric: "Stability", "GPT-5.2": 0.92, "Gemini 2.5": 0.88, "DeepSeek R1T2": 0.85 },
    { metric: "EN Performance", "GPT-5.2": 0.9, "Gemini 2.5": 0.922, "DeepSeek R1T2": 0.934 },
    { metric: "VI Performance", "GPT-5.2": 0.838, "Gemini 2.5": 0.869, "DeepSeek R1T2": 0.883 },
];
