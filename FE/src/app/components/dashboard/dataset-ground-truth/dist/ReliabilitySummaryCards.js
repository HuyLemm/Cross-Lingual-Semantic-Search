"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var tooltip_1 = require("../../ui/tooltip");
var lucide_react_1 = require("lucide-react");
function ReliabilitySummaryCards(_a) {
    var _b = _a.totalDocuments, totalDocuments = _b === void 0 ? 0 : _b, _c = _a.totalQAPairs, totalQAPairs = _c === void 0 ? 0 : _c, _d = _a.verifiedQAPairs, verifiedQAPairs = _d === void 0 ? 0 : _d, _e = _a.validationRate, validationRate = _e === void 0 ? 0 : _e, _f = _a.avgBiEncoder, avgBiEncoder = _f === void 0 ? 0 : _f, _g = _a.avgCrossEncoder, avgCrossEncoder = _g === void 0 ? 0 : _g, _h = _a.step1OnlyRate, step1OnlyRate = _h === void 0 ? 0 : _h;
    return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "Total Documents", value: totalDocuments, tooltip: "Number of source PDF documents" }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "Total QA", value: totalQAPairs, tooltip: "All generated QA pairs after filtering" }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "Verified QA (Final)", value: verifiedQAPairs, valueClass: "text-green-600 dark:text-green-400", tooltip: "QA passing both Bi-Encoder (Step 1) and Cross-Encoder (Step 2)" }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "QA Validation Rate", value: validationRate.toFixed(1) + "%", valueClass: "text-purple-600 dark:text-purple-400", tooltip: "Final acceptance rate = verified_final / total_QA" }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "Avg Bi-Encoder Score", value: avgBiEncoder.toFixed(2), valueClass: "text-blue-600 dark:text-blue-400", tooltip: "Mean(sim_qc) \u2014 semantic relevance (Step 1)" }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "Avg Cross-Encoder Score", value: avgCrossEncoder.toFixed(2), valueClass: "text-indigo-600 dark:text-indigo-400", tooltip: "Mean(ce_multi_prob) \u2014 entailment confidence (Step 2)" }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement(Metric, { label: "Step-1 Only Pass Rate", value: step1OnlyRate.toFixed(1) + "%", valueClass: "text-orange-600 dark:text-orange-400", tooltip: "QA passing Bi-Encoder but rejected by Cross-Encoder" })))));
}
exports["default"] = ReliabilitySummaryCards;
/* =========================
 * Small reusable metric UI
 * ========================= */
function Metric(_a) {
    var label = _a.label, value = _a.value, tooltip = _a.tooltip, _b = _a.valueClass, valueClass = _b === void 0 ? "text-gray-900 dark:text-white" : _b;
    return (React.createElement("div", { className: "flex items-start justify-between" },
        React.createElement("div", null,
            React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 mb-1" }, label),
            React.createElement("p", { className: "text-2xl font-bold " + valueClass }, value)),
        React.createElement(tooltip_1.Tooltip, null,
            React.createElement(tooltip_1.TooltipTrigger, null,
                React.createElement(lucide_react_1.Info, { className: "w-4 h-4 text-gray-400" })),
            React.createElement(tooltip_1.TooltipContent, null,
                React.createElement("p", { className: "text-xs" }, tooltip)))));
}
