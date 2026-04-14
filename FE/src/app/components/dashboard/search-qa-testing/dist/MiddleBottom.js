"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var badge_1 = require("../../ui/badge");
var helpers_1 = require("./helpers");
var lucide_react_1 = require("lucide-react");
// -------- Helpers: parse [TITLE] / [CONTENT] --------
function parseTaggedText(input) {
    var s = (input || "").trim();
    if (!s)
        return { title: "", content: "" };
    var titleMatch = s.match(/\[TITLE\]\s*([\s\S]*?)(?=\s*\[CONTENT\]|\s*$)/i);
    var contentMatch = s.match(/\[CONTENT\]\s*([\s\S]*)/i);
    var title = ((titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) || "").trim();
    var content = ((contentMatch === null || contentMatch === void 0 ? void 0 : contentMatch[1]) || "").trim();
    if (title || content)
        return { title: title, content: content };
    return { title: "", content: s };
}
function cleanTitle(t) {
    return (t || "").replace(/\s+/g, " ").trim();
}
function fileBasename(path) {
    var s = (path || "").trim();
    if (!s)
        return "";
    var parts = s.split(/[/\\]/);
    return parts[parts.length - 1] || s;
}
function scoreTone(score) {
    // ✅ màu theo score (tự nhiên, dễ nhìn)
    if (score >= 0.82)
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60";
    if (score >= 0.72)
        return "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900/60";
    if (score >= 0.62)
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/60";
    return "bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700";
}
function rankStripe(idx) {
    // ✅ thanh màu theo rank
    if (idx === 0)
        return "bg-emerald-500";
    if (idx === 1)
        return "bg-sky-500";
    if (idx === 2)
        return "bg-amber-500";
    return "bg-slate-300 dark:bg-slate-700";
}
function MiddleBottom(_a) {
    var results = _a.results, queryUsed = _a.queryUsed, query = _a.query, running = _a.running, hasSearched = _a.hasSearched, onOpenPdf = _a.onOpenPdf;
    var isInitial = !hasSearched && !running && results.length === 0;
    var isNoResults = hasSearched && !running && results.length === 0;
    var isLoading = running && results.length === 0;
    var highlightQuery = (queryUsed || query || "").trim();
    return (React.createElement("div", { className: "h-full p-6" },
        React.createElement("div", { className: "flex items-start justify-between gap-3 mb-4" },
            React.createElement("div", null,
                React.createElement("h3", { className: "text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide" },
                    "Retrieved Results",
                    " ",
                    React.createElement("span", { className: "text-slate-400" },
                        "(",
                        results.length,
                        ")")),
                queryUsed && (React.createElement("div", { className: "mt-2 text-sm text-slate-600 dark:text-slate-400" },
                    "Query used:",
                    " ",
                    React.createElement("span", { className: "font-mono break-words px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800" }, queryUsed)))),
            running && (React.createElement("div", { className: "inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" },
                React.createElement(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
                "Searching..."))),
        isInitial && (React.createElement(card_1.Card, { className: "border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40" },
            React.createElement(card_1.CardContent, { className: "p-10" },
                React.createElement("div", { className: "flex flex-col items-center text-center" },
                    React.createElement("div", { className: "h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center mb-4 shadow-sm" },
                        React.createElement(lucide_react_1.Inbox, { className: "h-5 w-5 text-slate-700 dark:text-slate-200" })),
                    React.createElement("p", { className: "text-sm font-semibold text-slate-900 dark:text-slate-100" }, "Ready to run"),
                    React.createElement("p", { className: "mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md" },
                        "Enter a query on the left and click",
                        " ",
                        React.createElement("span", { className: "font-semibold" }, "Run Experiment"),
                        ". Retrieved chunks will show here with rank and score."),
                    React.createElement("div", { className: "mt-5 flex flex-wrap items-center justify-center gap-2" },
                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs border-slate-300 dark:border-slate-600 dark:text-slate-200" }, "Tip: try Top-K = 10\u201320"),
                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs border-slate-300 dark:border-slate-600 dark:text-slate-200" }, "Works with EN / VI")))))),
        isLoading && (React.createElement("div", { className: "space-y-3" }, Array.from({ length: 5 }).map(function (_, i) { return (React.createElement(card_1.Card, { key: i, className: "border border-slate-200 dark:border-slate-700 dark:bg-slate-900/40" },
            React.createElement(card_1.CardContent, { className: "p-4" },
                React.createElement("div", { className: "flex items-center gap-2 mb-3" },
                    React.createElement("div", { className: "h-6 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" }),
                    React.createElement("div", { className: "h-6 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" })),
                React.createElement("div", { className: "h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mb-2" }),
                React.createElement("div", { className: "h-4 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse mb-2" }),
                React.createElement("div", { className: "h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" }),
                React.createElement("div", { className: "mt-3 h-3 w-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" })))); }))),
        isNoResults && (React.createElement(card_1.Card, { className: "border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40" },
            React.createElement(card_1.CardContent, { className: "p-10" },
                React.createElement("div", { className: "flex flex-col items-center text-center" },
                    React.createElement("div", { className: "h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center mb-4 shadow-sm" },
                        React.createElement(lucide_react_1.Search, { className: "h-5 w-5 text-slate-700 dark:text-slate-200" })),
                    React.createElement("p", { className: "text-sm font-semibold text-slate-900 dark:text-slate-100" }, "No matches found"),
                    React.createElement("p", { className: "mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md" }, "We ran the search, but nothing matched. Try rephrasing the query or increasing Top-K."),
                    React.createElement("div", { className: "mt-5 flex flex-wrap items-center justify-center gap-2" },
                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs border-slate-300 dark:border-slate-600 dark:text-slate-200" }, "Tip: use keywords"),
                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs border-slate-300 dark:border-slate-600 dark:text-slate-200" }, "Increase Top-K"),
                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs border-slate-300 dark:border-slate-600 dark:text-slate-200" }, "Try different language")))))),
        !isInitial && !isLoading && !isNoResults && (React.createElement("div", { className: "space-y-4" }, results.map(function (result, idx) {
            var _a;
            var tagged = parseTaggedText(result.raw_text || result.text || "");
            var title = cleanTitle(result.title || tagged.title);
            var content = tagged.content || result.text || "";
            var score = Number((_a = result.score) !== null && _a !== void 0 ? _a : 0);
            var fileName = fileBasename(result.file);
            return (React.createElement("div", { key: (result.file || "") + "|" + (result.title || "") + "|" + result.score + "|" + idx },
                React.createElement(card_1.Card, { className: [
                        "relative overflow-hidden border border-slate-200 dark:border-slate-700",
                        "bg-white dark:bg-slate-900/40",
                        "shadow-sm hover:shadow-md transition-shadow",
                        "hover:border-slate-300 dark:hover:border-slate-600",
                    ].join(" ") },
                    React.createElement("div", { className: "absolute left-0 top-0 h-full w-1.5 " + rankStripe(idx) }),
                    React.createElement(card_1.CardContent, { className: "p-5 pl-6" },
                        React.createElement("div", { className: "flex items-start justify-between gap-3 mb-3" },
                            React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                                React.createElement("span", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400" },
                                    "Rank ",
                                    idx + 1),
                                React.createElement("span", { className: [
                                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                                        scoreTone(score),
                                    ].join(" "), title: "Similarity score" }, Number.isFinite(score) ? score.toFixed(3) : "0.000"),
                                fileName && (React.createElement("button", { type: "button", onClick: function () { return onOpenPdf(result); }, className: "group", title: result.file || fileName },
                                    React.createElement(badge_1.Badge, { className: "\r\n        flex items-center gap-2\r\n        bg-blue-50 text-blue-700\r\n        dark:bg-blue-900/30 dark:text-blue-300\r\n        hover:bg-blue-100 dark:hover:bg-blue-900/50\r\n        cursor-pointer\r\n        transition\r\n        px-3 py-2\r\n        text-xs\r\n        font-medium\r\n        max-w-[420px]\r\n      " },
                                        React.createElement(lucide_react_1.FileText, { className: "!w-4 !h-4 shrink-0 group-hover:rotate-12 transition-transform" }),
                                        React.createElement("span", { className: "truncate group-hover:underline" }, fileName)))))),
                        title && (React.createElement("div", { className: "mb-2 text-base font-semibold text-slate-900 dark:text-slate-100 break-words" }, highlightQuery
                            ? helpers_1.highlightMatches(title, highlightQuery)
                            : title)),
                        React.createElement("div", { className: "text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words" }, highlightQuery
                            ? helpers_1.highlightMatches(content, highlightQuery)
                            : content),
                        result.file && (React.createElement("div", { className: "mt-2 text-[12px] text-slate-500 dark:text-slate-400 font-mono break-words" }, "Keywords:"))))));
        })))));
}
exports["default"] = MiddleBottom;
