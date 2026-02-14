"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var lucide_react_1 = require("lucide-react");
function TraceabilityVisualization() {
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "QA Dataset Generation & Verification Pipeline")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-slate-800 dark:to-slate-700 p-10 rounded-xl" },
                React.createElement("div", { className: "flex items-center justify-center gap-8 flex-wrap" },
                    React.createElement(StepBox, { color: "bg-blue-500", icon: "\uD83D\uDCE5", title: "1. Crawl PDFs", desc: "VJOL (VI) + Semantic Scholar (EN)" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-6 h-6 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-indigo-500", icon: "\uD83E\uDD16", title: "2. Generate QA", desc: "LLMs generate 7 QA per iteration" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-6 h-6 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-cyan-500", icon: "\uD83E\uDDF9", title: "3. Preprocess", desc: "Dedup + Title filtering" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-6 h-6 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-purple-500", icon: "\u2699\uFE0F", title: "4. Normalize + Validate", desc: "Metadata \u2192 Bi-Encoder \u2192 Cross-Encoder" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-6 h-6 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-green-500", icon: "\u2714", title: "5. Verified QA", desc: "Pass BOTH validation stages" })),
                React.createElement("div", { className: "flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400" },
                    React.createElement(lucide_react_1.RotateCcw, { className: "w-4 h-4" }),
                    "Repeat until each document reaches ",
                    React.createElement("span", { className: "font-semibold" }, "\u2265 7 verified QA pairs")),
                React.createElement("div", { className: "mt-8 max-w-4xl mx-auto text-center" },
                    React.createElement("p", { className: "text-sm text-gray-700 dark:text-gray-300 leading-relaxed" },
                        React.createElement("span", { className: "font-semibold" }, "Iterative QA Construction:"),
                        " ",
                        "Documents are crawled from Vietnamese (VJOL) and English (Semantic Scholar). QA pairs are generated in controlled batches, preprocessed, normalized, and semantically validated using a Bi-Encoder and Cross-Encoder. Only QA pairs passing both validation stages are accepted, ensuring high-quality, semantically grounded dataset construction."))))));
}
exports["default"] = TraceabilityVisualization;
/* ================= STEP BOX ================= */
function StepBox(_a) {
    var color = _a.color, icon = _a.icon, title = _a.title, desc = _a.desc;
    return (React.createElement("div", { className: "flex flex-col items-center text-center w-[150px]" },
        React.createElement("div", { className: "w-20 h-20 " + color + " rounded-xl flex items-center justify-center shadow-md" },
            React.createElement("span", { className: "text-2xl" }, icon)),
        React.createElement("p", { className: "mt-3 text-sm font-semibold text-gray-900 dark:text-white" }, title),
        React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug" }, desc)));
}
