"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var lucide_react_1 = require("lucide-react");
function ProcessingPipeline() {
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
                    React.createElement(StepBox, { color: "bg-fuchsia-500", icon: "\uD83E\uDDE9", title: "4. Chunk Traceability", desc: "Extract \u2192 Chunk \u2192 Assign chunk_id" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-6 h-6 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-purple-500", icon: "\u2699\uFE0F", title: "5. Normalize + Validate", desc: "Metadata \u2192 Bi-Encoder \u2192 Cross-Encoder" }),
                    React.createElement(lucide_react_1.ArrowRight, { className: "w-6 h-6 text-gray-400 shrink-0" }),
                    React.createElement(StepBox, { color: "bg-green-500", icon: "\u2714", title: "6. Verified QA", desc: "Pass BOTH validation stages" })),
                React.createElement("div", { className: "mt-8 max-w-4xl mx-auto" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(BranchCard, { title: "PDF has selectable text", bullets: [
                                "pypdf extract_text() (normal)",
                                "Chunking hard cap ≤ 4000 chars",
                                "Assign: chunk_id, chunk_char_len, chunk_preview",
                            ], footer: "used_ocr = false" }),
                        React.createElement(BranchCard, { title: "PDF is image-based / scanned", bullets: [
                                "Normal extract empty → OCR fallback",
                                "pdf2image + pytesseract (Poppler required)",
                                "Chunking ≤ 4000 chars → Assign same fields",
                            ], footer: "used_ocr = true" }))),
                React.createElement("div", { className: "flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400" },
                    React.createElement(lucide_react_1.RotateCcw, { className: "w-4 h-4" }),
                    "Repeat until each document reaches",
                    " ",
                    React.createElement("span", { className: "font-semibold" }, "\u2265 7 verified QA pairs")),
                React.createElement("div", { className: "mt-8 max-w-4xl mx-auto text-center" },
                    React.createElement("p", { className: "text-sm text-gray-700 dark:text-gray-300 leading-relaxed" },
                        React.createElement("span", { className: "font-semibold" }, "Iterative QA Construction:"),
                        " ",
                        "Documents are crawled from Vietnamese (VJOL) and English (Semantic Scholar). QA pairs are generated in controlled batches, preprocessed, then mapped back to document chunks for",
                        " ",
                        React.createElement("span", { className: "font-semibold" }, "traceability"),
                        " (chunk_id, chunk length, and preview). For scanned PDFs, OCR fallback is used. Finally, QA pairs are semantically validated using a Bi-Encoder and Cross-Encoder. Only pairs passing both validation stages are kept."))))));
}
exports["default"] = ProcessingPipeline;
/* ================= STEP BOX ================= */
function StepBox(_a) {
    var color = _a.color, icon = _a.icon, title = _a.title, desc = _a.desc;
    return (React.createElement("div", { className: "flex flex-col items-center text-center w-[150px]" },
        React.createElement("div", { className: "w-20 h-20 " + color + " rounded-xl flex items-center justify-center shadow-md" },
            React.createElement("span", { className: "text-2xl" }, icon)),
        React.createElement("p", { className: "mt-3 text-sm font-semibold text-gray-900 dark:text-white" }, title),
        React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug" }, desc)));
}
/* ================= BRANCH CARD ================= */
function BranchCard(_a) {
    var title = _a.title, bullets = _a.bullets, footer = _a.footer;
    return (React.createElement("div", { className: "rounded-xl border bg-white/70 dark:bg-slate-900/40 p-4" },
        React.createElement("p", { className: "text-sm font-semibold text-gray-900 dark:text-white" }, title),
        React.createElement("ul", { className: "mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300 list-disc pl-5" }, bullets.map(function (b) { return (React.createElement("li", { key: b }, b)); })),
        React.createElement("div", { className: "mt-3 text-[11px] text-gray-600 dark:text-gray-400 font-mono" }, footer)));
}
