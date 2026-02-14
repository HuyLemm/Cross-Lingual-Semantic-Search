"use strict";
exports.__esModule = true;
var sheet_1 = require("../../ui/sheet");
var badge_1 = require("../../ui/badge");
var separator_1 = require("../../ui/separator");
/* =========================
   MULTI KEYWORD HIGHLIGHT
========================= */
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text, keyword) {
    if (!keyword)
        return text;
    var words = keyword
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(escapeRegExp);
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
function SourceViewSheet(_a) {
    var _b, _c, _d, _e, _f;
    var qa = _a.qa, isOpen = _a.isOpen, onClose = _a.onClose, threshold = _a.threshold, searchQuery = _a.searchQuery;
    if (!qa)
        return null;
    var bi = Number((_b = qa.sim_qc) !== null && _b !== void 0 ? _b : 0);
    var ce = Number((_c = qa.ce_multi_prob) !== null && _c !== void 0 ? _c : 0);
    var biPass = bi >= threshold;
    var cePass = ce >= threshold;
    var verified = biPass && cePass;
    /* ================= Highlight context:
       - Answer grounding
       - Search query
    ================= */
    var renderContext = function () {
        var _a, _b, _c;
        var ctx = (_a = qa.context) !== null && _a !== void 0 ? _a : "";
        // highlight answer phrase
        if (qa.answer) {
            var phrase = qa.answer.slice(0, 120);
            var idx = ((_b = qa.context) !== null && _b !== void 0 ? _b : "")
                .toLowerCase()
                .indexOf(phrase.toLowerCase());
            if (idx !== -1) {
                var before = qa.context.slice(0, idx);
                var mid = qa.context.slice(idx, idx + phrase.length);
                var after = qa.context.slice(idx + phrase.length);
                ctx = (React.createElement(React.Fragment, null,
                    before,
                    React.createElement("mark", { className: "bg-yellow-300 dark:bg-yellow-600 px-1 rounded" }, mid),
                    after));
            }
        }
        // apply search highlight over result
        if (searchQuery) {
            var text = typeof ctx === "string"
                ? ctx
                : ((_c = qa.context) !== null && _c !== void 0 ? _c : "");
            return highlight(text, searchQuery);
        }
        return ctx;
    };
    return (React.createElement(sheet_1.Sheet, { open: isOpen, onOpenChange: onClose },
        React.createElement(sheet_1.SheetContent, { className: "w-[550px] min-w-[450px] max-w-none overflow-y-auto" },
            React.createElement(sheet_1.SheetHeader, null,
                React.createElement(sheet_1.SheetTitle, null, "QA Source Traceability"),
                React.createElement(sheet_1.SheetDescription, null, "Inspect semantic grounding and validation of this QA pair")),
            React.createElement("div", { className: "space-y-6 p-4" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("span", { className: "text-sm font-semibold" }, "QA ID"),
                    React.createElement(badge_1.Badge, { variant: "secondary", className: "font-mono text-xs" }, qa.id)),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-semibold mb-1" }, "Question"),
                    React.createElement("div", { className: "p-3 rounded-lg bg-blue-50 border" }, highlight((_d = qa.question) !== null && _d !== void 0 ? _d : "", searchQuery))),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-semibold mb-1" }, "Ground Truth Answer"),
                    React.createElement("div", { className: "p-3 rounded-lg bg-green-50 border" }, highlight((_e = qa.answer) !== null && _e !== void 0 ? _e : "", searchQuery))),
                React.createElement(separator_1.Separator, null),
                React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-gray-50 border" },
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Bi-Encoder"),
                        React.createElement("p", { className: "text-lg font-bold " + (biPass ? "text-green-600" : "text-red-500") }, bi.toFixed(3))),
                    React.createElement("div", { className: "p-3 rounded-lg bg-gray-50 border" },
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Cross-Encoder"),
                        React.createElement("p", { className: "text-lg font-bold " + (cePass ? "text-green-600" : "text-red-500") }, ce.toFixed(3)))),
                React.createElement("div", { className: "p-3 rounded-lg border " + (verified
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200") },
                    React.createElement(badge_1.Badge, { className: verified ? "bg-green-600 text-white" : "bg-red-600 text-white" }, verified ? "Verified" : "Not Verified"),
                    React.createElement("p", { className: "text-xs mt-2 text-gray-600" }, verified
                        ? "Both Bi-Encoder and Cross-Encoder pass threshold."
                        : "One or more validation scores below threshold.")),
                React.createElement("div", { className: "p-3 rounded-lg bg-gray-50 border" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Source File"),
                    React.createElement("p", { className: "text-sm font-medium" }, highlight((_f = qa.sourceDocument) !== null && _f !== void 0 ? _f : "", searchQuery)),
                    React.createElement("div", { className: "flex gap-2 mt-1" },
                        React.createElement(badge_1.Badge, { variant: "outline" }, qa.language),
                        React.createElement(badge_1.Badge, { variant: "secondary" }, qa.model))),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-semibold mb-2" }, "Source Context"),
                    React.createElement("div", { className: "p-4 rounded-lg bg-purple-50 border whitespace-pre-wrap leading-relaxed" }, renderContext()),
                    React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "Highlight shows grounding + search match"))))));
}
exports["default"] = SourceViewSheet;
