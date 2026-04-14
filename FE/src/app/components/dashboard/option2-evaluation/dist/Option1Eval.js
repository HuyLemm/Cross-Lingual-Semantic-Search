"use strict";
exports.__esModule = true;
// option1-evaluation/Option1Eval.tsx
var react_1 = require("react");
var card_1 = require("@/app/components/ui/card");
var badge_1 = require("@/app/components/ui/badge");
var tabs_1 = require("@/app/components/ui/tabs");
var option1_constants_1 = require("./option1.constants");
// Tabs (you will create the remaining ones later)
var TabLanguage_1 = require("./TabLanguage");
var TabErrors_1 = require("./TabErrors");
// TODO: Create these later (placeholder)
var Placeholder = function (_a) {
    var title = _a.title;
    return (React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, title)),
        React.createElement(card_1.CardContent, null,
            React.createElement("p", { className: "text-xs text-gray-500 dark:text-slate-400 italic" }, "Placeholder \u2014 implement this tab file next."))));
};
function Option1Eval() {
    var _a = react_1.useState("language"), activePage = _a[0], setActivePage = _a[1];
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
                            option1_constants_1.config.name),
                        React.createElement(badge_1.Badge, { className: "bg-blue-600 text-white" }, "Baseline (Option 1)"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-4 gap-4 text-xs" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Language:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, option1_constants_1.config.language)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Chunk Embedding:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, option1_constants_1.config.chunkEmbedding)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Vector Index:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, option1_constants_1.config.vectorIndex)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-gray-600 dark:text-slate-400" }, "Stage 2 Reranker:"),
                            React.createElement("p", { className: "font-mono text-gray-900 dark:text-slate-100 mt-1" }, option1_constants_1.config.stage2Reranker))))),
            React.createElement(tabs_1.Tabs, { value: activePage, onValueChange: setActivePage, className: "space-y-6" },
                React.createElement(tabs_1.TabsList, { className: "grid grid-cols-7 w-full bg-gray-100 dark:bg-slate-800 p-1 rounded-lg" },
                    React.createElement(tabs_1.TabsTrigger, { value: "summary", className: "text-xs" }, "Executive Summary"),
                    React.createElement(tabs_1.TabsTrigger, { value: "model", className: "text-xs" }, "Model Comparison"),
                    React.createElement(tabs_1.TabsTrigger, { value: "language", className: "text-xs" }, "Language"),
                    React.createElement(tabs_1.TabsTrigger, { value: "latency", className: "text-xs" }, "Latency"),
                    React.createElement(tabs_1.TabsTrigger, { value: "ranking", className: "text-xs" }, "Ranking"),
                    React.createElement(tabs_1.TabsTrigger, { value: "tables", className: "text-xs" }, "Detailed Tables"),
                    React.createElement(tabs_1.TabsTrigger, { value: "errors", className: "text-xs" }, "Error Analysis")),
                React.createElement(tabs_1.TabsContent, { value: "summary" },
                    React.createElement(Placeholder, { title: "Executive Summary" })),
                React.createElement(tabs_1.TabsContent, { value: "model" },
                    React.createElement(Placeholder, { title: "Model Comparison" })),
                React.createElement(tabs_1.TabsContent, { value: "language" },
                    React.createElement(TabLanguage_1["default"], null)),
                React.createElement(tabs_1.TabsContent, { value: "latency" },
                    React.createElement(Placeholder, { title: "Latency" })),
                React.createElement(tabs_1.TabsContent, { value: "ranking" },
                    React.createElement(Placeholder, { title: "Ranking" })),
                React.createElement(tabs_1.TabsContent, { value: "tables" },
                    React.createElement(Placeholder, { title: "Detailed Tables" })),
                React.createElement(tabs_1.TabsContent, { value: "errors" },
                    React.createElement(TabErrors_1["default"], null))))));
}
exports["default"] = Option1Eval;
