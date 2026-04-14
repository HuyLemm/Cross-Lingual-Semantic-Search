// RightPanel.tsx
"use client";
"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var badge_1 = require("../../ui/badge");
var lucide_react_1 = require("lucide-react");
var helpers_1 = require("./helpers");
function RightPanel(props) {
    var snapshot = props.snapshot, returned = props.returned;
    return (React.createElement("div", { className: [
            // ✅ fixed width
            "h-full w-[320px] shrink-0",
            "border-l border-gray-200 dark:border-slate-700",
            "bg-gray-50 dark:bg-slate-800 overflow-y-auto",
        ].join(" ") },
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("h3", { className: "text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wide" }, "Run Metrics"),
            !snapshot && (React.createElement(card_1.Card, { className: "border-dashed border-gray-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40" },
                React.createElement(card_1.CardContent, { className: "p-8 text-center" },
                    React.createElement("div", { className: "flex flex-col items-center" },
                        React.createElement("div", { className: "h-12 w-12 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center mb-4" },
                            React.createElement(lucide_react_1.Search, { className: "h-5 w-5 text-gray-600 dark:text-slate-300" })),
                        React.createElement("p", { className: "text-sm font-semibold text-gray-900 dark:text-slate-100" }, "Waiting for Run"),
                        React.createElement("p", { className: "text-xs mt-1 text-gray-600 dark:text-slate-400 max-w-xs" },
                            "Right panel will update only after you click",
                            " ",
                            React.createElement("span", { className: "font-semibold" }, "Run Experiment"),
                            "."),
                        React.createElement("div", { className: "mt-4 flex gap-2 flex-wrap justify-center" },
                            React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, "Snapshot on Run"),
                            React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, "Latency")))))),
            snapshot && (React.createElement(React.Fragment, null,
                React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 dark:bg-slate-850" },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Configuration Snapshot")),
                    React.createElement(card_1.CardContent, { className: "space-y-2 text-xs" },
                        React.createElement(Row, { k: "Language", v: helpers_1.labelLanguage(snapshot.language) }),
                        React.createElement(Row, { k: "Chunk Embed", v: helpers_1.labelEmbedModel(snapshot.chunkEmbeddingModel) }),
                        React.createElement(Row, { k: "Query Embed", v: helpers_1.labelEmbedModel(snapshot.queryEmbeddingModel) }),
                        React.createElement(Row, { k: "Vector Index", v: helpers_1.labelVectorIndex(snapshot.vectorIndex) }),
                        React.createElement(Row, { k: "Retrieval", v: helpers_1.labelRetrieval(snapshot.retrievalEngine) }),
                        React.createElement(Row, { k: "Reranker", v: helpers_1.labelReranker(snapshot.reranker) }),
                        React.createElement(Row, { k: "Ranking", v: helpers_1.labelRanking(snapshot.rankingMethod) }),
                        React.createElement(Row, { k: "Top-K", v: String(snapshot.topK[0]) }),
                        React.createElement(Row, { k: "Returned", v: String(returned) }))),
                React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 dark:bg-slate-850" },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2" },
                            React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
                            "Run Results")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-xs" },
                        React.createElement(Metric, { label: "Latency (ms)", value: "-" }))))))));
}
exports["default"] = RightPanel;
function Row(_a) {
    var k = _a.k, v = _a.v;
    return (React.createElement("div", { className: "flex items-start gap-3" },
        React.createElement("span", { className: "text-gray-600 dark:text-slate-400 shrink-0" }, k),
        React.createElement("span", { className: "ml-auto text-right font-mono text-gray-900 dark:text-slate-100 min-w-0 max-w-[200px] whitespace-normal break-words" }, v)));
}
function Metric(_a) {
    var label = _a.label, value = _a.value;
    return (React.createElement("div", { className: "flex items-start gap-3 border border-gray-200 dark:border-slate-700 rounded px-3 py-2" },
        React.createElement("span", { className: "text-gray-600 dark:text-slate-400 shrink-0" }, label),
        React.createElement("span", { className: "ml-auto text-right font-mono text-gray-900 dark:text-slate-100 min-w-0 max-w-[200px] whitespace-normal break-words" }, value)));
}
