"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("../../ui/card");
var table_1 = require("../../ui/table");
var badge_1 = require("../../ui/badge");
function DatasetStatisticsTable(_a) {
    var data = _a.data;
    var _b = react_1.useState('verifiedRatio'), sortColumn = _b[0], setSortColumn = _b[1];
    var _c = react_1.useState('desc'), sortDirection = _c[0], setSortDirection = _c[1];
    var handleSort = function (column) {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };
    var sortedData = __spreadArrays(data).sort(function (a, b) {
        var aVal = a[sortColumn];
        var bVal = b[sortColumn];
        var direction = sortDirection === 'asc' ? 1 : -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return (aVal - bVal) * direction;
        }
        return String(aVal).localeCompare(String(bVal)) * direction;
    });
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "QA Dataset Statistics"),
            React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1" }, "Distribution and reliability metrics of verified QA dataset (sortable)")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return handleSort('language'); } },
                                "Language ",
                                sortColumn === 'language' && (sortDirection === 'asc' ? '↑' : '↓')),
                            React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return handleSort('model'); } },
                                "Model ",
                                sortColumn === 'model' && (sortDirection === 'asc' ? '↑' : '↓')),
                            React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return handleSort('verification'); } },
                                "Verified By ",
                                sortColumn === 'verification' && (sortDirection === 'asc' ? '↑' : '↓')),
                            React.createElement(table_1.TableHead, { className: "text-right cursor-pointer", onClick: function () { return handleSort('qaCount'); } },
                                "QA Count ",
                                sortColumn === 'qaCount' && (sortDirection === 'asc' ? '↑' : '↓')),
                            React.createElement(table_1.TableHead, { className: "text-right cursor-pointer", onClick: function () { return handleSort('avgSimilarity'); } },
                                "Avg Similarity ",
                                sortColumn === 'avgSimilarity' && (sortDirection === 'asc' ? '↑' : '↓')),
                            React.createElement(table_1.TableHead, { className: "text-right cursor-pointer", onClick: function () { return handleSort('avgEntailment'); } },
                                "Avg Entailment ",
                                sortColumn === 'avgEntailment' && (sortDirection === 'asc' ? '↑' : '↓')),
                            React.createElement(table_1.TableHead, { className: "text-right cursor-pointer", onClick: function () { return handleSort('verifiedRatio'); } },
                                "Verified % ",
                                sortColumn === 'verifiedRatio' && (sortDirection === 'asc' ? '↑' : '↓')))),
                    React.createElement(table_1.TableBody, null, sortedData.map(function (row, idx) { return (React.createElement(table_1.TableRow, { key: idx },
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono" }, row.language)),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, row.model)),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: row.verification === 'both'
                                    ? 'default'
                                    : row.verification === 'bi'
                                        ? 'outline'
                                        : 'secondary', className: "text-xs" }, row.verification)),
                        React.createElement(table_1.TableCell, { className: "text-right" }, row.qaCount.toLocaleString()),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement("span", { className: row.avgSimilarity >= 0.86
                                    ? 'text-green-600 font-medium'
                                    : row.avgSimilarity >= 0.82
                                        ? 'text-yellow-600 font-medium'
                                        : 'text-red-600 font-medium' }, row.avgSimilarity.toFixed(3))),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement("span", { className: row.avgEntailment >= 0.85
                                    ? 'text-green-600 font-medium'
                                    : row.avgEntailment >= 0.80
                                        ? 'text-yellow-600 font-medium'
                                        : 'text-red-600 font-medium' }, row.avgEntailment.toFixed(3))),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement("span", { className: row.verifiedRatio >= 0.80
                                    ? 'text-green-600 font-medium'
                                    : row.verifiedRatio >= 0.75
                                        ? 'text-yellow-600 font-medium'
                                        : 'text-red-600 font-medium' },
                                (row.verifiedRatio * 100).toFixed(1),
                                "%")))); })))))));
}
exports["default"] = DatasetStatisticsTable;
