"use strict";
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("../ui/card");
var badge_1 = require("../ui/badge");
var tabs_1 = require("../ui/tabs");
var TabSummary_1 = require("./option1-evaluation/TabSummary");
var TabModelComparison_1 = require("./option1-evaluation/TabModelComparison");
var TabLanguage_1 = require("./option1-evaluation/TabLanguage");
var TabLatency_1 = require("./option1-evaluation/TabLatency");
var TabRanking_1 = require("./option1-evaluation/TabRanking");
var TabTables_1 = require("./option1-evaluation/TabTables");
var TabErrors_1 = require("./option1-evaluation/TabErrors");
// Baseline configuration (Option 1)
var config = {
    name: "Baseline Configuration",
    language: "English",
    chunkEmbedding: "MiniLM (paraphrase-multilingual)",
    queryEmbedding: "MiniLM (paraphrase-multilingual)",
    vectorIndex: "FAISS IndexFlatIP (CPU)",
    stage1Retrieval: "FAISS CPU",
    stage2Reranker: "Hybrid Scoring (cosine + keyword)",
    rankingMethod: "Heuristic Score"
};
function Option1Evaluation() {
    var _a = react_1.useState("summary"), activePage = _a[0], setActivePage = _a[1];
    return (React.createElement("div", { className: "h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900" },
        React.createElement("div", { className: "p-8 space-y-6" },
            React.createElement("div", { className: "mb-6" },
                React.createElement("h2", { className: "text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2" }, "Multilingual RAG Retrieval Evaluation \u2013 Comparative Analysis"),
                React.createElement("p", { className: "text-sm text-gray-600 dark:text-slate-400" }, "Comparative Evaluation Across 18 Retrieval Configurations")),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/20" },
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide" },
                            "Active Configuration: ",
                            config.name),
                        React.createElement(badge_1.Badge, { className: "bg-blue-600 text-white" }, "Baseline (Option 1)"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-4 gap-4 text-xs" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Language:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, config.language)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Chunk Embedding:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, config.chunkEmbedding)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Vector Index:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, config.vectorIndex)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Stage 2 Reranker:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, config.stage2Reranker))))),
            React.createElement(tabs_1.Tabs, { value: activePage, onValueChange: setActivePage, className: "space-y-6" },
                React.createElement(tabs_1.TabsList, { className: "grid grid-cols-7 w-full bg-gray-100 dark:bg-slate-800 p-1 rounded-lg" },
                    React.createElement(tabs_1.TabsTrigger, { value: "summary", className: "text-xs" }, "Executive Summary"),
                    React.createElement(tabs_1.TabsTrigger, { value: "model", className: "text-xs" }, "Model Comparison"),
                    React.createElement(tabs_1.TabsTrigger, { value: "language", className: "text-xs" }, "Language"),
                    React.createElement(tabs_1.TabsTrigger, { value: "latency", className: "text-xs" }, "Latency"),
                    React.createElement(tabs_1.TabsTrigger, { value: "ranking", className: "text-xs" }, "Ranking"),
                    React.createElement(tabs_1.TabsTrigger, { value: "tables", className: "text-xs" }, "Detailed Tables"),
                    React.createElement(tabs_1.TabsTrigger, { value: "errors", className: "text-xs" }, "Error Analysis")),
                React.createElement(tabs_1.TabsContent, { value: "summary", className: "space-y-6" },
                    React.createElement(TabSummary_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "model", className: "space-y-6" },
                    React.createElement(TabModelComparison_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "language", className: "space-y-6" },
                    React.createElement(TabLanguage_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "latency", className: "space-y-6" },
                    React.createElement(TabLatency_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "ranking", className: "space-y-6" },
                    React.createElement(TabRanking_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "tables", className: "space-y-6" },
                    React.createElement(TabTables_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "errors", className: "space-y-6" },
                    React.createElement(TabErrors_1["default"], null))))));
}
exports["default"] = Option1Evaluation;
