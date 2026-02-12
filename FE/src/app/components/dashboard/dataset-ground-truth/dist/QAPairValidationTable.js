"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var table_1 = require("../../ui/table");
var badge_1 = require("../../ui/badge");
var button_1 = require("../../ui/button");
var input_1 = require("../../ui/input");
var lucide_react_1 = require("lucide-react");
var loading_spinner_1 = require("../../ui/loading-spinner");
/* =========================
 * VERIFIED LOGIC (FINAL)
 *
 * Rules:
 * - Bi >= 0.7 AND CE >= 0.7 → Verified
 * - Bi < 0.7  AND CE >= 0.7 → Low Similarity
 * - Bi >= 0.7 AND CE < 0.7  → Low Cross-Encoder
 * - Bi < 0.7  AND CE < 0.7  → Weak Both
 * ========================= */
function getVerificationStatus(qa, th) {
    var _a, _b;
    var bi = (_a = qa.sim_qc) !== null && _a !== void 0 ? _a : 0;
    var ce = (_b = qa.ce_multi_prob) !== null && _b !== void 0 ? _b : 0;
    if (bi >= th && ce >= th)
        return "Verified";
    if (bi < th && ce >= th)
        return "Low Similarity";
    if (bi >= th && ce < th)
        return "Low Cross-Encoder";
    return "Weak Both";
}
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/* =========================
 * MULTI KEYWORD HIGHLIGHT
 * ========================= */
function highlight(text, keyword) {
    if (!keyword)
        return text;
    var words = keyword.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (words.length === 0)
        return text;
    var regex = new RegExp("(" + words.join("|") + ")", "gi");
    var result = [];
    var lastIndex = 0;
    text.replace(regex, function (match, _p1, offset) {
        if (offset > lastIndex) {
            result.push(text.slice(lastIndex, offset));
        }
        result.push(React.createElement("mark", { key: offset, className: "bg-yellow-200 dark:bg-yellow-600 px-[2px] rounded" }, match));
        lastIndex = offset + match.length;
        return match;
    });
    if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
    }
    return result;
}
/* =========================
 * STATUS BADGE
 * ========================= */
function getStatusBadge(status) {
    switch (status) {
        case "Verified":
            return (React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }, "Verified"));
        case "Low Similarity":
            return (React.createElement(badge_1.Badge, { className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" }, "Low Similarity"));
        case "Low Cross-Encoder":
            return (React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }, "Low CE"));
        case "Weak Both":
            return (React.createElement(badge_1.Badge, { className: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300" }, "Weak Both"));
        default:
            return React.createElement(badge_1.Badge, { variant: "outline" }, status);
    }
}
function QAPairValidationTable(_a) {
    var _b = _a.qaPairs, qaPairs = _b === void 0 ? [] : _b, _c = _a.totalQAPairs, totalQAPairs = _c === void 0 ? 0 : _c, page = _a.page, pageSize = _a.pageSize, qualityThreshold = _a.qualityThreshold, searchQuery = _a.searchQuery, _d = _a.loading, loading = _d === void 0 ? false : _d, onSearchChange = _a.onSearchChange, onPageChange = _a.onPageChange, onViewSource = _a.onViewSource;
    var totalPages = Math.max(1, Math.ceil(totalQAPairs / pageSize));
    var start = totalQAPairs === 0 ? 0 : (page - 1) * pageSize + 1;
    var end = Math.min(page * pageSize, totalQAPairs);
    /* ===== BUILD PAGE LIST (1 2 ... LAST) ===== */
    var pages = [];
    if (totalPages <= 5) {
        for (var i = 1; i <= totalPages; i++)
            pages.push(i);
    }
    else {
        pages.push(1, 2);
        if (page > 4)
            pages.push("...");
        var midStart = Math.max(3, page - 1);
        var midEnd = Math.min(totalPages - 2, page + 1);
        for (var i = midStart; i <= midEnd; i++)
            pages.push(i);
        if (page < totalPages - 3)
            pages.push("...");
        pages.push(totalPages);
    }
    return (React.createElement(card_1.Card, { className: "w-full" },
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", null,
                React.createElement(card_1.CardTitle, null, "QA Pairs Validation"),
                React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1" }, "Core trust evidence: every QA pair is traceable to source documents"))),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "flex items-center justify-between mb-4" },
                React.createElement("div", { className: "text-sm text-gray-600 dark:text-gray-400" },
                    "Showing ",
                    start,
                    "\u2013",
                    end,
                    " of ",
                    totalQAPairs,
                    " QA pairs"),
                React.createElement(input_1.Input, { placeholder: "Search question, answer, or source...", value: searchQuery, onChange: function (e) { return onSearchChange(e.target.value); }, className: "w-[300px] h-9 text-sm" })),
            React.createElement("div", { className: "w-full overflow-x-auto border rounded-lg" },
                React.createElement(table_1.Table, { className: "min-w-[1100px] table-fixed" },
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, { className: "w-[150px]" }, "QA ID"),
                            React.createElement(table_1.TableHead, { className: "w-[280px]" }, "Question"),
                            React.createElement(table_1.TableHead, { className: "w-[280px]" }, "Ground Truth Answer"),
                            React.createElement(table_1.TableHead, { className: "w-[280px]" }, "Source Document"),
                            React.createElement(table_1.TableHead, { className: "w-[80px] text-center" }, "Lang"),
                            React.createElement(table_1.TableHead, { className: "w-[80px] text-right" }, "Bi-Encoder"),
                            React.createElement(table_1.TableHead, { className: "w-[80px] text-right" }, "Cross-Encoder"),
                            React.createElement(table_1.TableHead, { className: "w-[100px] text-center" }, "Status"),
                            React.createElement(table_1.TableHead, { className: "w-[100px] text-center" }, "Action"))),
                    React.createElement(table_1.TableBody, null,
                        qaPairs.map(function (qa) {
                            var _a, _b, _c;
                            var status = getVerificationStatus(qa, qualityThreshold);
                            var bi = (_a = qa.sim_qc) !== null && _a !== void 0 ? _a : 0;
                            var ce = (_b = qa.ce_multi_prob) !== null && _b !== void 0 ? _b : 0;
                            return (React.createElement(table_1.TableRow, { key: qa.id },
                                React.createElement(table_1.TableCell, { className: "font-mono text-xs break-all" }, qa.id),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "text-sm break-words whitespace-normal" }, highlight(qa.question, searchQuery))),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "text-sm text-gray-600 dark:text-gray-400 break-words whitespace-normal" }, highlight(qa.answer, searchQuery))),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "secondary", className: "block text-[12px] whitespace-normal break-words leading-tight" }, highlight((_c = qa.sourceDocument) !== null && _c !== void 0 ? _c : "Unknown", searchQuery))),
                                React.createElement(table_1.TableCell, { className: "text-center" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono" }, qa.language.toUpperCase())),
                                React.createElement(table_1.TableCell, { className: "text-right font-medium" },
                                    React.createElement("span", { className: bi >= qualityThreshold
                                            ? "text-green-600"
                                            : "text-red-500" }, bi.toFixed(2))),
                                React.createElement(table_1.TableCell, { className: "text-right font-medium" },
                                    React.createElement("span", { className: ce >= qualityThreshold
                                            ? "text-green-600"
                                            : "text-red-500" }, ce.toFixed(2))),
                                React.createElement(table_1.TableCell, { className: "text-center" }, getStatusBadge(status)),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex justify-center" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return onViewSource(qa); } },
                                            React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-1" }),
                                            "View")))));
                        }),
                        loading && (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 9, className: "py-10" },
                                React.createElement("div", { className: "flex justify-center" },
                                    React.createElement(loading_spinner_1["default"], { size: 26 }))))),
                        !loading && qaPairs.length === 0 && (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-10 text-gray-500" }, "No QA pairs found"))))),
                React.createElement("div", { className: "flex items-center justify-center mt-4 gap-1 text-sm mb-4" },
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", disabled: page === 1, onClick: function () { return onPageChange(page - 1); } }, "\u2039"),
                    pages.map(function (p, i) {
                        return p === "..." ? (React.createElement("span", { key: i, className: "px-2 text-gray-400" }, "...")) : (React.createElement(button_1.Button, { key: p, size: "sm", variant: p === page ? "default" : "outline", onClick: function () { return onPageChange(Number(p)); } }, p));
                    }),
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", disabled: page >= totalPages, onClick: function () { return onPageChange(page + 1); } }, "\u203A"))))));
}
exports["default"] = QAPairValidationTable;
