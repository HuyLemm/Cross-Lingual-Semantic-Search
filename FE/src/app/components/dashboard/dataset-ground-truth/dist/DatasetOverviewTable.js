"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var table_1 = require("../../ui/table");
var badge_1 = require("../../ui/badge");
var lucide_react_1 = require("lucide-react");
function DatasetOverviewTable(_a) {
    var _b = _a.datasets, datasets = _b === void 0 ? [] : _b;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Dataset Overview")),
        React.createElement(card_1.CardContent, null,
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Dataset"),
                        React.createElement(table_1.TableHead, null, "Language"),
                        React.createElement(table_1.TableHead, null, "Source"),
                        React.createElement(table_1.TableHead, null, "Model"),
                        React.createElement(table_1.TableHead, null, "Experiment"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "QA Pairs"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Avg Bi-Encoder"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Avg Cross-Encoder"),
                        React.createElement(table_1.TableHead, { className: "text-center" }, "Validation"))),
                React.createElement(table_1.TableBody, null, datasets.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-8 text-gray-500" }, "No dataset available"))) : (datasets.map(function (d) {
                    var _a, _b;
                    var verified = d.avgCrossEncoder >= 0.9;
                    return (React.createElement(table_1.TableRow, { key: d.id },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, d.name),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono" }, d.language)),
                        React.createElement(table_1.TableCell, { className: "text-sm text-gray-600 dark:text-gray-400" }, d.source),
                        React.createElement(table_1.TableCell, { className: "font-mono text-xs" }, d.model),
                        React.createElement(table_1.TableCell, { className: "font-mono" }, d.experiment),
                        React.createElement(table_1.TableCell, { className: "text-right" }, d.qaPairs.toLocaleString()),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement("span", { className: d.avgBiEncoder >= 0.85
                                    ? 'text-green-600 font-medium'
                                    : 'text-orange-500 font-medium' }, Number((_a = d.avgBiEncoder) !== null && _a !== void 0 ? _a : 0).toFixed(2))),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement("span", { className: d.avgCrossEncoder >= 0.9
                                    ? 'text-green-600 font-medium'
                                    : 'text-orange-500 font-medium' }, Number((_b = d.avgCrossEncoder) !== null && _b !== void 0 ? _b : 0).toFixed(2))),
                        React.createElement(table_1.TableCell, { className: "text-center" }, verified ? (React.createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500 mx-auto" })) : (React.createElement(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-orange-500 mx-auto" })))));
                })))))));
}
exports["default"] = DatasetOverviewTable;
