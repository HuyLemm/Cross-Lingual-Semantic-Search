"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var DatasetMetricsChart_1 = require("./language-evaluation/DatasetMetricsChart");
var CrossLingualCharts_1 = require("./language-evaluation/CrossLingualCharts");
var ErrorAnalysisChart_1 = require("./language-evaluation/ErrorAnalysisChart");
var DatasetStatisticsTable_1 = require("./language-evaluation/DatasetStatisticsTable");
var DatasetInsightCards_1 = require("./language-evaluation/DatasetInsightCards");
var datasetEvaluationData_1 = require("./language-evaluation/datasetEvaluationData");
function LanguageEvaluation() {
    var _a = react_1.useState("EN"), sourceLanguage = _a[0], setSourceLanguage = _a[1];
    var _b = react_1.useState("VI"), targetLanguage = _b[0], setTargetLanguage = _b[1];
    var _c = react_1.useState("all"), selectedModel = _c[0], setSelectedModel = _c[1];
    // Filter data based on selected model
    var filteredLanguageMetrics = react_1.useMemo(function () {
        return selectedModel === "all"
            ? datasetEvaluationData_1.allLanguageMetrics
            : datasetEvaluationData_1.allLanguageMetrics.filter(function (m) { return m.model === selectedModel; });
    }, [selectedModel]);
    var filteredCrossLingualMetrics = react_1.useMemo(function () {
        return selectedModel === "all"
            ? datasetEvaluationData_1.allCrossLingualMetrics
            : datasetEvaluationData_1.allCrossLingualMetrics.filter(function (m) { return m.model === selectedModel; });
    }, [selectedModel]);
    // Aggregate metrics by language for charts (average across models if "all" is selected)
    var aggregateByLanguage = function (metrics) {
        var languageGroups = metrics.reduce(function (acc, metric) {
            if (!acc[metric.language]) {
                acc[metric.language] = [];
            }
            acc[metric.language].push(metric);
            return acc;
        }, {});
        return Object.entries(languageGroups).map(function (_a) {
            var language = _a[0], data = _a[1];
            return ({
                language: language,
                recall: data.reduce(function (sum, m) { return sum + m.recall; }, 0) / data.length,
                precision: data.reduce(function (sum, m) { return sum + m.precision; }, 0) / data.length,
                f1: data.reduce(function (sum, m) { return sum + m.f1; }, 0) / data.length,
                avgSimilarity: data.reduce(function (sum, m) { return sum + m.avgSimilarity; }, 0) / data.length
            });
        });
    };
    var languageChartData = react_1.useMemo(function () { return aggregateByLanguage(filteredLanguageMetrics); }, [filteredLanguageMetrics]);
    // Error analysis data
    var errorAnalysisData = react_1.useMemo(function () {
        return aggregateByLanguage(filteredLanguageMetrics).map(function (lang) {
            var metrics = filteredLanguageMetrics.filter(function (m) { return m.language === lang.language; });
            var avgFP = metrics.reduce(function (sum, m) { return sum + m.falsePositiveRate; }, 0) /
                metrics.length;
            var avgFN = metrics.reduce(function (sum, m) { return sum + m.falseNegativeRate; }, 0) /
                metrics.length;
            return {
                language: lang.language,
                falsePositive: avgFP,
                falseNegative: avgFN
            };
        });
    }, [filteredLanguageMetrics]);
    // Calculate insights
    var insights = react_1.useMemo(function () {
        // Best performing language
        var bestLang = __spreadArrays(filteredLanguageMetrics).sort(function (a, b) { return b.successRate - a.successRate; })[0];
        // Most reliable cross-lingual pair
        var bestCrossLingual = __spreadArrays(filteredCrossLingualMetrics).sort(function (a, b) { return b.retrievalAccuracy - a.retrievalAccuracy; })[0];
        // Most challenging pair
        var worstCrossLingual = __spreadArrays(filteredCrossLingualMetrics).sort(function (a, b) { return a.retrievalAccuracy - b.retrievalAccuracy; })[0];
        // Most stable model across languages
        var modelStability = ["GPT-5.2", "Gemini 2.5 Flash", "DeepSeek R1T2"].map(function (model) {
            var modelMetrics = datasetEvaluationData_1.allLanguageMetrics.filter(function (m) { return m.model === model; });
            var avgScore = modelMetrics.reduce(function (sum, m) { return sum + m.successRate; }, 0) /
                modelMetrics.length;
            var variance = modelMetrics.reduce(function (sum, m) { return sum + Math.pow(m.successRate - avgScore, 2); }, 0) / modelMetrics.length;
            var stdDev = Math.sqrt(variance);
            return { model: model, avgScore: avgScore, stdDev: stdDev };
        });
        var mostStable = modelStability.sort(function (a, b) { return a.stdDev - b.stdDev; })[0];
        return { bestLang: bestLang, bestCrossLingual: bestCrossLingual, worstCrossLingual: worstCrossLingual, mostStable: mostStable };
    }, [filteredLanguageMetrics, filteredCrossLingualMetrics]);
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(LanguageEvaluationHeader, { sourceLanguage: sourceLanguage, targetLanguage: targetLanguage, selectedModel: selectedModel, onSourceLanguageChange: setSourceLanguage, onTargetLanguageChange: setTargetLanguage, onModelChange: setSelectedModel }),
        React.createElement(DatasetMetricsChart_1["default"], { data: languageChartData }),
        React.createElement(CrossLingualCharts_1["default"], { data: filteredCrossLingualMetrics }),
        React.createElement(ErrorAnalysisChart_1["default"], { data: errorAnalysisData }),
        React.createElement(DatasetStatisticsTable_1["default"], { data: filteredLanguageMetrics }),
        React.createElement(DatasetInsightCards_1["default"], { insights: insights })));
}
exports["default"] = LanguageEvaluation;
