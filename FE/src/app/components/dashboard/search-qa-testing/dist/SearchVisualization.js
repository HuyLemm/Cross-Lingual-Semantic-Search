"use client";
"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var lucide_react_1 = require("lucide-react");
function SearchVisualization() {
    return (React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 dark:bg-slate-850" },
        React.createElement(card_1.CardHeader, { className: "pb-3" },
            React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wide" }, "Search Pipeline")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-xl" },
                React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 text-center mb-4" }, "End-to-end: Build Index \u2192 Query \u2192 Retrieve \u2192 Rerank \u2192 Return"),
                React.createElement("div", { className: "flex items-center justify-center gap-6 flex-wrap" },
                    React.createElement(StepBox, { color: "bg-indigo-600", icon: "\uD83D\uDDC2\uFE0F", title: "1. Build Corpus Index", desc: "Load docs \u2192 chunk \u2192 normalize \u2192 embed chunks \u2192 L2 \u2192 build FAISS \u2192 save", badge: "1\u20137" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-blue-500", icon: "\u2328\uFE0F", title: "2. User Query", desc: "User enters a question", badge: "8" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-cyan-500", icon: "\uD83E\uDDFC", title: "3. Prepare Query", desc: "Normalize query + extract keywords/facts", badge: "9\u201310" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-fuchsia-500", icon: "\uD83E\uDDE0", title: "4. Encode Query", desc: "Query embedding + L2 normalization", badge: "11\u201312" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-purple-500", icon: "\u26A1", title: "5. Retrieve Candidates", desc: "FAISS stage-1 retrieval \u2192 select top-N candidates", badge: "13\u201314" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-rose-500", icon: "\uD83E\uDDEA", title: "6. Rerank & Sort", desc: "Stage-2 rerank \u2192 sort by relevance score", badge: "15\u201316" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-emerald-500", icon: "\u2705", title: "7. Return Results", desc: "Return top_k final ranked results", badge: "17" })),
                React.createElement("div", { className: "mt-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement(MiniCard, { title: "Old method (baseline)", bullets: [
                            "Chunk/query embeddings: MiniLM",
                            "FAISS: IndexFlatIP CPU",
                            "Stage-2: Hybrid scoring",
                            "Ranking: Heuristic score",
                        ] }),
                    React.createElement(MiniCard, { title: "New method (upgraded)", bullets: [
                            "Chunk/query embeddings: BGE-M3",
                            "FAISS: IndexFlatIP CPU (72 threads)",
                            "Stage-2: bge-reranker-v2-m3 (cross-encoder)",
                            "Ranking: Cross-encoder score",
                        ] })),
                React.createElement("p", { className: "mt-6 text-center text-sm text-gray-700 dark:text-gray-300" }, "Common steps are grouped into higher-level stages while preserving the original workflow.")))));
}
exports["default"] = SearchVisualization;
/* ================= STEP BOX ================= */
function StepBox(_a) {
    var color = _a.color, icon = _a.icon, title = _a.title, desc = _a.desc, badge = _a.badge;
    return (React.createElement("div", { className: "flex flex-col items-center text-center w-[170px]" },
        React.createElement("div", { className: "relative" },
            React.createElement("div", { className: "w-20 h-20 " + color + " rounded-xl flex items-center justify-center shadow-md" },
                React.createElement("span", { className: "text-2xl" }, icon)),
            badge && (React.createElement("div", { className: "absolute -top-2 -right-2 text-[10px] px-2 py-[2px] rounded-full bg-white/90 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold" }, badge))),
        React.createElement("p", { className: "mt-3 text-sm font-semibold text-gray-900 dark:text-white" }, title),
        React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug break-words" }, desc)));
}
/* ================= MINI CARD ================= */
function MiniCard(_a) {
    var title = _a.title, bullets = _a.bullets;
    return (React.createElement("div", { className: "rounded-xl border border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-4" },
        React.createElement("p", { className: "text-sm font-semibold text-gray-900 dark:text-white" }, title),
        React.createElement("ul", { className: "mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300 list-disc pl-5" }, bullets.map(function (b) { return (React.createElement("li", { key: b }, b)); }))));
}
