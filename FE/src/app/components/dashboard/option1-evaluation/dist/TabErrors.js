"use strict";
exports.__esModule = true;
var card_1 = require("@/app/components/ui/card");
var badge_1 = require("@/app/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var option1_data_1 = require("../option1.data");
var lowPerformingQueries = [
    {
        id: "Q_042",
        query: "Cross-lingual transfer learning mechanisms",
        expectedRank: 1,
        actualRank: 5,
        category: "Translation Error"
    },
    {
        id: "Q_087",
        query: "Multilingual embeddings comparison",
        expectedRank: 1,
        actualRank: 4,
        category: "Semantic Mismatch"
    },
    {
        id: "Q_123",
        query: "Attention mechanism variations",
        expectedRank: 2,
        actualRank: 7,
        category: "Missing Context"
    },
];
var caseStudies = [
    {
        query: "How does BERT handle multilingual contexts?",
        expectedRank: 1,
        actualRank: 4,
        retrievedChunk: "BERT uses WordPiece tokenization...",
        explanation: "Retrieved chunk focused on tokenization rather than multilingual handling"
    },
    {
        query: "Transformer architecture for Vietnamese NLP",
        expectedRank: 1,
        actualRank: 3,
        retrievedChunk: "Transformers consist of encoder-decoder...",
        explanation: "Generic transformer description, missing Vietnamese-specific details"
    },
];
function TabErrors() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-2 gap-6" },
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Failure Category Breakdown")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.PieChart, null,
                            React.createElement(recharts_1.Pie, { data: option1_data_1.errorCategories, cx: "50%", cy: "50%", labelLine: false, label: function (entry) { return entry.name + ": " + entry.value + "%"; }, outerRadius: 100, fill: "#8884d8", dataKey: "value" }, option1_data_1.errorCategories.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: entry.color })); })),
                            React.createElement(recharts_1.Tooltip, null))))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center" },
                        React.createElement(lucide_react_1.AlertTriangle, { className: "w-4 h-4 mr-2 text-red-600" }),
                        "Low-Performing Queries")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-3" }, lowPerformingQueries.map(function (item, idx) { return (React.createElement("div", { key: idx, className: "p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded" },
                        React.createElement("div", { className: "flex items-start justify-between mb-2" },
                            React.createElement("p", { className: "text-xs font-mono text-gray-600 dark:text-slate-400" }, item.id),
                            React.createElement(badge_1.Badge, { className: "bg-red-600 text-white text-xs" }, item.category)),
                        React.createElement("p", { className: "text-xs text-gray-900 dark:text-slate-100 mb-2" }, item.query),
                        React.createElement("div", { className: "flex items-center space-x-3 text-xs" },
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" },
                                "Expected: ",
                                React.createElement("span", { className: "font-mono text-green-600" },
                                    "#",
                                    item.expectedRank)),
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" },
                                "Actual: ",
                                React.createElement("span", { className: "font-mono text-red-600" },
                                    "#",
                                    item.actualRank))))); }))))),
        React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Error Case Studies")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-4" }, caseStudies.map(function (item, idx) { return (React.createElement("div", { key: idx, className: "p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4 text-xs" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600 dark:text-slate-400 mb-1" }, "Query:"),
                            React.createElement("p", { className: "font-medium text-gray-900 dark:text-slate-100" }, item.query)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600 dark:text-slate-400 mb-1" }, "Ranking:"),
                            React.createElement("p", { className: "font-mono" },
                                "Expected: ",
                                React.createElement("span", { className: "text-green-600" },
                                    "#",
                                    item.expectedRank),
                                " \u2192 Actual:",
                                " ",
                                React.createElement("span", { className: "text-red-600" },
                                    "#",
                                    item.actualRank))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600 dark:text-slate-400 mb-1" }, "Retrieved Chunk:"),
                            React.createElement("p", { className: "text-gray-700 dark:text-slate-300 italic" }, item.retrievedChunk)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600 dark:text-slate-400 mb-1" }, "Error Explanation:"),
                            React.createElement("p", { className: "text-gray-700 dark:text-slate-300" }, item.explanation))))); }))))));
}
exports["default"] = TabErrors;
