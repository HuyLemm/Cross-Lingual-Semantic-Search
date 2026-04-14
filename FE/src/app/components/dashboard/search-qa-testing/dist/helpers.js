"use strict";
exports.__esModule = true;
exports.highlightMatches = exports.labelLanguage = exports.labelRanking = exports.labelReranker = exports.labelRetrieval = exports.labelVectorIndex = exports.labelEmbedModel = void 0;
var react_1 = require("react");
// ---------- Labels ----------
exports.labelEmbedModel = function (v) { return (v === "minilm" ? "MiniLM" : "BGE-M3"); };
exports.labelVectorIndex = function (v) {
    return v === "flatip_cpu" ? "FAISS IndexFlatIP (CPU)" : "FAISS IndexFlatIP (72 threads)";
};
exports.labelRetrieval = function (v) {
    return v === "faiss_cpu" ? "FAISS CPU" : "FAISS CPU (72 threads)";
};
exports.labelReranker = function (v) {
    return v === "hybrid" ? "Hybrid Scoring (cosine + keyword + fact)" : "BGE Reranker v2 m3";
};
exports.labelRanking = function (v) {
    return v === "heuristic" ? "Heuristic Score" : "Cross-Encoder Score";
};
exports.labelLanguage = function (v) { return (v === "auto" ? "AUTO" : v.toUpperCase()); };
// ---------- Highlight ----------
function highlightMatches(text, query) {
    var stopWords = new Set([
        "how", "does", "the", "is", "in", "a", "an", "and", "or", "but",
        "what", "when", "where", "why", "who", "which", "that", "this", "these", "those",
    ]);
    var queryTokens = query
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(function (word) { return word.length > 0; });
    var phrases = [];
    for (var i = 0; i <= queryTokens.length - 4; i++) {
        var phrase = queryTokens.slice(i, i + 4);
        if (phrase.some(function (w) { return !stopWords.has(w) && w.length > 3; })) {
            phrases.push({ text: phrase.join(" "), length: 4 });
        }
    }
    for (var i = 0; i <= queryTokens.length - 3; i++) {
        var phrase = queryTokens.slice(i, i + 3);
        if (phrase.some(function (w) { return !stopWords.has(w) && w.length > 3; })) {
            phrases.push({ text: phrase.join(" "), length: 3 });
        }
    }
    for (var i = 0; i <= queryTokens.length - 2; i++) {
        var phrase = queryTokens.slice(i, i + 2);
        if (phrase.some(function (w) { return !stopWords.has(w) && w.length > 3; })) {
            phrases.push({ text: phrase.join(" "), length: 2 });
        }
    }
    var keywords = queryTokens
        .filter(function (word) { return word.length > 3 && !stopWords.has(word); })
        .map(function (word) { return ({ text: word, length: 1 }); });
    phrases.push.apply(phrases, keywords);
    if (phrases.length === 0)
        return text;
    var highlights = [];
    var lowerText = text.toLowerCase();
    phrases
        .sort(function (a, b) { return b.length - a.length; })
        .forEach(function (phrase) {
        var searchText = phrase.text;
        var startPos = 0;
        var _loop_1 = function () {
            var index = lowerText.indexOf(searchText, startPos);
            if (index === -1)
                return "break";
            var end = index + searchText.length;
            var overlaps = highlights.some(function (h) {
                return (index >= h.start && index < h.end) ||
                    (end > h.start && end <= h.end) ||
                    (index <= h.start && end >= h.end);
            });
            if (!overlaps) {
                var beforeOk = index === 0 || /\s/.test(text[index - 1]);
                var afterOk = end === text.length || /\s/.test(text[end]);
                if (beforeOk && afterOk) {
                    highlights.push({
                        start: index,
                        end: end,
                        text: text.substring(index, end),
                        type: phrase.length > 1 ? "phrase" : "keyword"
                    });
                }
            }
            startPos = index + 1;
        };
        while (true) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    });
    highlights.sort(function (a, b) { return a.start - b.start; });
    var parts = [];
    var lastIndex = 0;
    highlights.forEach(function (h, idx) {
        if (h.start > lastIndex)
            parts.push(text.substring(lastIndex, h.start));
        parts.push(react_1["default"].createElement("mark", { key: h.type + "-" + idx, className: h.type === "phrase"
                ? "bg-amber-100 dark:bg-amber-900/40 text-gray-900 dark:text-amber-100 px-1 rounded font-semibold border-b-2 border-amber-400 dark:border-amber-600"
                : "bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-1 rounded font-medium" }, h.text));
        lastIndex = h.end;
    });
    if (lastIndex < text.length)
        parts.push(text.substring(lastIndex));
    return parts.length > 0 ? react_1["default"].createElement(react_1["default"].Fragment, null, parts) : text;
}
exports.highlightMatches = highlightMatches;
