"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var card_1 = require("@/app/components/ui/card");
var badge_1 = require("@/app/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var option1_constants_1 = require("../option1.constants");
var option1_data_1 = require("../option1.data");
function TabSummary() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-4 gap-4" },
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardContent, { className: "pt-5" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Best Top-1"),
                        React.createElement(lucide_react_1.Trophy, { className: "w-4 h-4 text-blue-600" })),
                    React.createElement("p", { className: "text-2xl font-semibold text-gray-900 dark:text-slate-100" },
                        (option1_data_1.bestTop1 * 100).toFixed(1),
                        "%"),
                    React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "Gemini EN 0.8"))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardContent, { className: "pt-5" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Best Top-10"),
                        React.createElement(lucide_react_1.Target, { className: "w-4 h-4 text-emerald-600" })),
                    React.createElement("p", { className: "text-2xl font-semibold text-gray-900 dark:text-slate-100" },
                        (option1_data_1.bestTop10 * 100).toFixed(1),
                        "%"),
                    React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "Gemini EN 0.8"))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardContent, { className: "pt-5" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Best MRR"),
                        React.createElement(lucide_react_1.Target, { className: "w-4 h-4 text-purple-600" })),
                    React.createElement("p", { className: "text-2xl font-semibold text-gray-900 dark:text-slate-100" }, option1_data_1.bestMRR.toFixed(3)),
                    React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "Gemini EN 0.8"))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardContent, { className: "pt-5" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Fastest Latency"),
                        React.createElement(lucide_react_1.Zap, { className: "w-4 h-4 text-amber-600" })),
                    React.createElement("p", { className: "text-2xl font-semibold text-gray-900 dark:text-slate-100" },
                        option1_data_1.fastestLatency,
                        "ms"),
                    React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "Gemini EN 0.8")))),
        React.createElement("div", { className: "grid grid-cols-2 gap-6" },
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Cross-Model Performance Comparison")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.RadarChart, { data: option1_data_1.radarData },
                            React.createElement(recharts_1.PolarGrid, { stroke: "#e5e7eb" }),
                            React.createElement(recharts_1.PolarAngleAxis, { dataKey: "metric", tick: { fontSize: 11, fill: "#6b7280" } }),
                            React.createElement(recharts_1.PolarRadiusAxis, { domain: [0.6, 1], tick: { fontSize: 9, fill: "#6b7280" } }),
                            React.createElement(recharts_1.Radar, { name: "DeepSeek", dataKey: "DeepSeek", stroke: option1_constants_1.MODEL_COLORS.DeepSeek, fill: option1_constants_1.MODEL_COLORS.DeepSeek, fillOpacity: 0.25, strokeWidth: 2 }),
                            React.createElement(recharts_1.Radar, { name: "Gemini", dataKey: "Gemini", stroke: option1_constants_1.MODEL_COLORS.Gemini, fill: option1_constants_1.MODEL_COLORS.Gemini, fillOpacity: 0.25, strokeWidth: 2 }),
                            React.createElement(recharts_1.Radar, { name: "GPT", dataKey: "GPT", stroke: option1_constants_1.MODEL_COLORS.GPT, fill: option1_constants_1.MODEL_COLORS.GPT, fillOpacity: 0.25, strokeWidth: 2 }),
                            React.createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "11px" }, iconSize: 10 }),
                            React.createElement(recharts_1.Tooltip, null))),
                    React.createElement("p", { className: "text-xs text-gray-500 dark:text-slate-400 mt-2 text-center italic" }, "Note: Scale adjusted (0.6-1.0) for better visual distinction"))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Top-1 Accuracy Across All 18 Configurations")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: option1_data_1.allConfigs },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", opacity: 0.5 }),
                            React.createElement(recharts_1.XAxis, { dataKey: "threshold", tick: { fontSize: 9 }, angle: -45, textAnchor: "end", height: 60 }),
                            React.createElement(recharts_1.YAxis, { domain: [0.75, 1], tick: { fontSize: 10 } }),
                            React.createElement(recharts_1.Tooltip, { content: function (_a) {
                                    var active = _a.active, payload = _a.payload;
                                    if (active && payload && payload.length) {
                                        var data = payload[0].payload;
                                        return (React.createElement("div", { className: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 shadow-lg" },
                                            React.createElement("p", { className: "text-xs font-semibold" },
                                                data.model,
                                                " - ",
                                                data.language,
                                                " (",
                                                data.threshold,
                                                ")"),
                                            React.createElement("p", { className: "text-xs text-blue-600" },
                                                "Top-1: ",
                                                (data.top1 * 100).toFixed(1),
                                                "%")));
                                    }
                                    return null;
                                } }),
                            React.createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "11px" }, iconSize: 10 }),
                            React.createElement(recharts_1.Bar, { dataKey: "top1", radius: [4, 4, 0, 0] }, option1_data_1.allConfigs.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: option1_constants_1.MODEL_COLORS[entry.model] })); })))),
                    React.createElement("div", { className: "flex items-center justify-center gap-4 mt-3" }, ["DeepSeek", "Gemini", "GPT"].map(function (m) { return (React.createElement("div", { key: m, className: "flex items-center gap-1" },
                        React.createElement("div", { className: "w-3 h-3 rounded", style: { backgroundColor: option1_constants_1.MODEL_COLORS[m] } }),
                        React.createElement("span", { className: "text-xs text-gray-600 dark:text-slate-400" }, m))); }))))),
        React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Overall Configuration Ranking")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-auto max-h-[400px]" },
                    React.createElement("table", { className: "w-full text-xs" },
                        React.createElement("thead", { className: "bg-gray-50 dark:bg-slate-800 sticky top-0" },
                            React.createElement("tr", null,
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Rank"),
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Model"),
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Language"),
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Threshold"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "Top-1"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "Top-10"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "MRR"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "Latency"))),
                        React.createElement("tbody", { className: "bg-white dark:bg-slate-850" }, __spreadArrays(option1_data_1.allConfigs).sort(function (a, b) { return b.top1 - a.top1; })
                            .map(function (cfg, idx) { return (React.createElement("tr", { key: idx, className: "border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50" },
                            React.createElement("td", { className: "py-2 px-3" },
                                React.createElement(badge_1.Badge, { variant: "outline", className: idx < 3 ? "border-amber-500 text-amber-700 font-semibold" : "" },
                                    "#",
                                    idx + 1)),
                            React.createElement("td", { className: "py-2 px-3" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("div", { className: "w-2 h-2 rounded-full", style: {
                                            backgroundColor: option1_constants_1.MODEL_COLORS[cfg.model]
                                        } }),
                                    React.createElement("span", { className: "font-semibold" }, cfg.model))),
                            React.createElement("td", { className: "py-2 px-3" },
                                React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, cfg.language)),
                            React.createElement("td", { className: "py-2 px-3 font-mono text-xs" }, cfg.threshold),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400" },
                                (cfg.top1 * 100).toFixed(1),
                                "%"),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono text-xs" },
                                (cfg.top10 * 100).toFixed(1),
                                "%"),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono text-xs" }, cfg.mrr.toFixed(3)),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono text-xs" },
                                cfg.latency,
                                "ms"))); }))))))));
}
exports["default"] = TabSummary;
