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
var DatasetEvaluationHeader_1 = require("./dataset-evaluation/DatasetEvaluationHeader");
var DatasetMetricsChart_1 = require("./dataset-evaluation/DatasetMetricsChart");
var DatasetStatisticsTable_1 = require("./dataset-evaluation/DatasetStatisticsTable");
var DatasetInsightCards_1 = require("./dataset-evaluation/DatasetInsightCards");
var loading_spinner_1 = require("../ui/loading-spinner");
function DatasetEvaluation() {
    var _a = react_1.useState("all"), language = _a[0], setLanguage = _a[1];
    var _b = react_1.useState("all"), selectedModel = _b[0], setSelectedModel = _b[1];
    var _c = react_1.useState("both"), verification = _c[0], setVerification = _c[1];
    var _d = react_1.useState([]), metrics = _d[0], setMetrics = _d[1];
    var _e = react_1.useState(true), loading = _e[0], setLoading = _e[1];
    /* =========================================================
     * FETCH BACKEND METRICS
     * ========================================================= */
    react_1.useEffect(function () {
        setLoading(true);
        fetch("http://localhost:4000/dataset-eval/metrics?language=" + language + "&model=" + selectedModel + "&verification=" + verification)
            .then(function (r) { return r.json(); })
            .then(function (d) {
            setMetrics(d.items || []);
        })["catch"](function (err) {
            console.error("Failed to load dataset metrics", err);
            setMetrics([]);
        })["finally"](function () { return setLoading(false); });
    }, [language, selectedModel, verification]);
    /* =========================================================
     * CHART DATA (aggregate by language)
     * ========================================================= */
    var chartData = react_1.useMemo(function () {
        var groups = {};
        metrics.forEach(function (m) {
            if (!groups[m.language])
                groups[m.language] = [];
            groups[m.language].push(m);
        });
        return Object.entries(groups).map(function (_a) {
            var lang = _a[0], data = _a[1];
            return ({
                language: lang,
                avgSimilarity: data.reduce(function (s, d) { return s + d.avgSimilarity; }, 0) / data.length,
                avgEntailment: data.reduce(function (s, d) { return s + d.avgEntailment; }, 0) / data.length,
                verifiedRatio: data.reduce(function (s, d) { return s + d.verifiedRatio; }, 0) / data.length
            });
        });
    }, [metrics]);
    /* =========================================================
     * INSIGHTS
     * ========================================================= */
    var insights = react_1.useMemo(function () {
        if (!metrics.length)
            return null;
        var bestLanguage = __spreadArrays(metrics).sort(function (a, b) { return b.verifiedRatio - a.verifiedRatio; })[0];
        var highestSimilarity = __spreadArrays(metrics).sort(function (a, b) { return b.avgSimilarity - a.avgSimilarity; })[0];
        var strongestEntailment = __spreadArrays(metrics).sort(function (a, b) { return b.avgEntailment - a.avgEntailment; })[0];
        return {
            bestLanguage: bestLanguage,
            highestSimilarity: highestSimilarity,
            strongestEntailment: strongestEntailment
        };
    }, [metrics]);
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(DatasetEvaluationHeader_1["default"], { language: language, selectedModel: selectedModel, verification: verification, onLanguageChange: setLanguage, onModelChange: setSelectedModel, onVerificationChange: setVerification }),
        loading ? (React.createElement("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" },
            React.createElement("div", { className: "bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg" },
                React.createElement(loading_spinner_1["default"], { size: 32 }),
                React.createElement("p", { className: "text-sm text-gray-500 mt-2 text-center" }, "Loading data...")))) : (React.createElement(React.Fragment, null,
            React.createElement(DatasetMetricsChart_1["default"], { data: chartData }),
            React.createElement(DatasetStatisticsTable_1["default"], { data: metrics }),
            insights && React.createElement(DatasetInsightCards_1["default"], { insights: insights })))));
}
exports["default"] = DatasetEvaluation;
