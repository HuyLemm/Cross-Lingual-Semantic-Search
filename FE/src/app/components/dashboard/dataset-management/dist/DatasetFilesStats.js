"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var lucide_react_1 = require("lucide-react");
function formatNumber(n) {
    return n.toLocaleString("en-US");
}
function formatBytes(bytes) {
    if (!Number.isFinite(bytes))
        return "0 B";
    var units = ["B", "KB", "MB", "GB", "TB"];
    var b = bytes;
    var i = 0;
    while (b >= 1024 && i < units.length - 1) {
        b /= 1024;
        i++;
    }
    return b.toFixed(i === 0 ? 0 : 1) + " " + units[i];
}
function DatasetFilesStats(_a) {
    var _b, _c, _d, _e;
    var stats = _a.stats;
    var totalDocs = (_b = stats === null || stats === void 0 ? void 0 : stats.totalDocs) !== null && _b !== void 0 ? _b : 0;
    var englishDocs = (_c = stats === null || stats === void 0 ? void 0 : stats.englishDocs) !== null && _c !== void 0 ? _c : 0;
    var vietnameseDocs = (_d = stats === null || stats === void 0 ? void 0 : stats.vietnameseDocs) !== null && _d !== void 0 ? _d : 0;
    var totalBytes = (_e = stats === null || stats === void 0 ? void 0 : stats.totalBytes) !== null && _e !== void 0 ? _e : 0;
    var cards = [
        {
            label: "Total PDF Documents",
            value: formatNumber(totalDocs),
            icon: lucide_react_1.FileText,
            description: "All PDFs in dataset folders",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            label: "English Documents",
            value: formatNumber(englishDocs),
            icon: lucide_react_1.BookOpen,
            description: "PDFs under English dataset",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        },
        {
            label: "Vietnamese Documents",
            value: formatNumber(vietnameseDocs),
            icon: lucide_react_1.Languages,
            description: "PDFs under Vietnamese dataset",
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            label: "Total Size",
            value: formatBytes(totalBytes),
            icon: lucide_react_1.Database,
            description: "Total bytes of PDFs",
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-50 dark:bg-orange-900/20"
        },
    ];
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Dataset Overview")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, cards.map(function (stat, index) {
                var Icon = stat.icon;
                return (React.createElement("div", { key: index, className: "p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800" },
                    React.createElement("div", { className: "flex items-start justify-between mb-3" },
                        React.createElement("div", { className: "p-2 rounded-lg " + stat.bgColor },
                            React.createElement(Icon, { className: "w-5 h-5 " + stat.color }))),
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-1" }, stat.value),
                    React.createElement("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" }, stat.label),
                    React.createElement("div", { className: "text-xs text-gray-500 dark:text-gray-400" }, stat.description)));
            })))));
}
exports["default"] = DatasetFilesStats;
