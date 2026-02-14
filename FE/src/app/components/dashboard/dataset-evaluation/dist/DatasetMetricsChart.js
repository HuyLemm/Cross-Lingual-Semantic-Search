"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var tooltip_1 = require("../../ui/tooltip");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var CustomTooltip = function (_a) {
    var active = _a.active, payload = _a.payload, label = _a.label;
    if (active && payload && payload.length) {
        return (React.createElement("div", { className: "bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg" },
            React.createElement("p", { className: "font-semibold text-gray-900 dark:text-white mb-2" }, label),
            payload.map(function (entry, index) { return (React.createElement("p", { key: index, className: "text-sm", style: { color: entry.color } },
                entry.name,
                ":",
                ' ',
                React.createElement("span", { className: "font-semibold" }, typeof entry.value === 'number'
                    ? entry.value.toFixed(3)
                    : entry.value))); })));
    }
    return null;
};
function DatasetMetricsChart(_a) {
    var data = _a.data;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement(card_1.CardTitle, null, "QA Dataset Quality by Language"),
                    React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1" }, "Semantic similarity, entailment correctness, and verification reliability")),
                React.createElement(tooltip_1.Tooltip, null,
                    React.createElement(tooltip_1.TooltipTrigger, null,
                        React.createElement(lucide_react_1.Info, { className: "w-5 h-5 text-gray-400" })),
                    React.createElement(tooltip_1.TooltipContent, null,
                        React.createElement("div", { className: "text-xs space-y-1 max-w-xs" },
                            React.createElement("p", null,
                                React.createElement("strong", null, "Avg Similarity:"),
                                " Bi-encoder semantic similarity"),
                            React.createElement("p", null,
                                React.createElement("strong", null, "Avg Entailment:"),
                                " Cross-encoder correctness score"),
                            React.createElement("p", null,
                                React.createElement("strong", null, "Verified Ratio:"),
                                " % QA passing both encoders")))))),
        React.createElement(card_1.CardContent, null,
            React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 350 },
                React.createElement(recharts_1.BarChart, { data: data },
                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-gray-200 dark:stroke-slate-700" }),
                    React.createElement(recharts_1.XAxis, { dataKey: "language", className: "text-xs", tick: { fill: 'currentColor' } }),
                    React.createElement(recharts_1.YAxis, { domain: [0, 1], className: "text-xs", tick: { fill: 'currentColor' } }),
                    React.createElement(recharts_1.Tooltip, { content: React.createElement(CustomTooltip, null) }),
                    React.createElement(recharts_1.Legend, { wrapperStyle: { paddingTop: '20px' }, iconType: "rect" }),
                    React.createElement(recharts_1.Bar, { dataKey: "avgSimilarity", fill: "#3b82f6", name: "Avg Similarity", radius: [4, 4, 0, 0] }),
                    React.createElement(recharts_1.Bar, { dataKey: "avgEntailment", fill: "#10b981", name: "Avg Entailment", radius: [4, 4, 0, 0] }),
                    React.createElement(recharts_1.Bar, { dataKey: "verifiedRatio", fill: "#8b5cf6", name: "Verified Ratio", radius: [4, 4, 0, 0] }))))));
}
exports["default"] = DatasetMetricsChart;
