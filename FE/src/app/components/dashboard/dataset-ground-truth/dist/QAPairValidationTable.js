"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var table_1 = require("../../ui/table");
var badge_1 = require("../../ui/badge");
var button_1 = require("../../ui/button");
var lucide_react_1 = require("lucide-react");
/* =========================
 * VERIFIED LOGIC
 * ========================= */
function getVerificationStatus(qa) {
    var _a, _b;
    var bi = (_a = qa.sim_qc) !== null && _a !== void 0 ? _a : 0;
    var ce = (_b = qa.ce_multi_prob) !== null && _b !== void 0 ? _b : 0;
    if (bi >= 0.7 && ce >= 0.7)
        return 'Verified';
    if (bi < 0.7)
        return 'Low Similarity';
    return 'Low Cross-Encoder';
}
/* =========================
 * STATUS BADGE
 * ========================= */
function getStatusBadge(status) {
    switch (status) {
        case 'Verified':
            return (React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }, "Verified"));
        case 'Low Similarity':
            return (React.createElement(badge_1.Badge, { className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" }, "Low Similarity"));
        case 'Low Cross-Encoder':
            return (React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }, "Low CE"));
        default:
            return React.createElement(badge_1.Badge, { variant: "outline" }, status);
    }
}
function QAPairValidationTable(_a) {
    var _b = _a.qaPairs, qaPairs = _b === void 0 ? [] : _b, _c = _a.totalQAPairs, totalQAPairs = _c === void 0 ? 0 : _c, onViewSource = _a.onViewSource;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", null,
                React.createElement(card_1.CardTitle, null, "QA Pairs Validation"),
                React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1" }, "Core trust evidence: every QA pair is traceable to source documents"))),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4" },
                "Showing ",
                qaPairs.length,
                " of ",
                totalQAPairs,
                " QA pairs"),
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "QA ID"),
                        React.createElement(table_1.TableHead, { className: "min-w-[250px]" }, "Question"),
                        React.createElement(table_1.TableHead, { className: "min-w-[300px]" }, "Ground Truth Answer"),
                        React.createElement(table_1.TableHead, null, "Source Document"),
                        React.createElement(table_1.TableHead, null, "Language"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Bi-Encoder"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Cross-Encoder"),
                        React.createElement(table_1.TableHead, { className: "text-center" }, "Verification Status"),
                        React.createElement(table_1.TableHead, { className: "text-center" }, "Actions"))),
                React.createElement(table_1.TableBody, null,
                    qaPairs.map(function (qa) {
                        var _a, _b, _c;
                        var status = getVerificationStatus(qa);
                        var bi = (_a = qa.sim_qc) !== null && _a !== void 0 ? _a : 0;
                        var ce = (_b = qa.ce_multi_prob) !== null && _b !== void 0 ? _b : 0;
                        return (React.createElement(table_1.TableRow, { key: qa.id },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, qa.id),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "text-sm max-w-[250px] line-clamp-2" }, qa.question)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "text-sm text-gray-600 dark:text-gray-400 max-w-[300px] line-clamp-2" }, qa.answer)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "secondary", className: "font-mono text-xs" }, (_c = qa.sourceDocument) !== null && _c !== void 0 ? _c : 'Unknown')),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono" }, qa.language.toUpperCase())),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: bi >= 0.7
                                        ? 'text-green-600 font-medium'
                                        : 'text-red-500 font-medium' }, bi.toFixed(2))),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: ce >= 0.7
                                        ? 'text-green-600 font-medium'
                                        : 'text-red-500 font-medium' }, ce.toFixed(2))),
                            React.createElement(table_1.TableCell, { className: "text-center" }, getStatusBadge(status)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "flex justify-center" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return onViewSource(qa); } },
                                        React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-1" }),
                                        "View Source")))));
                    }),
                    qaPairs.length === 0 && (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-8 text-gray-500" }, "No QA pairs found"))))))));
}
exports["default"] = QAPairValidationTable;
