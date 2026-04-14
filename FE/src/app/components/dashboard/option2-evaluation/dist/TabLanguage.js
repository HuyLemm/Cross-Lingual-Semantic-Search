"use strict";
exports.__esModule = true;
var card_1 = require("@/app/components/ui/card");
var recharts_1 = require("recharts");
var option1_constants_1 = require("../option1.constants");
var option1_data_1 = require("../option1.data");
function TabLanguage() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-2 gap-6" },
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "English vs Vietnamese Performance")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: option1_data_1.languageComparison },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", opacity: 0.5 }),
                            React.createElement(recharts_1.XAxis, { dataKey: "model", tick: { fontSize: 11 } }),
                            React.createElement(recharts_1.YAxis, { domain: [0.75, 1], tick: { fontSize: 11 } }),
                            React.createElement(recharts_1.Tooltip, null),
                            React.createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "11px" }, iconSize: 10 }),
                            React.createElement(recharts_1.Bar, { dataKey: "EN", fill: option1_constants_1.MODEL_COLORS.DeepSeek, name: "English", radius: [4, 4, 0, 0] }),
                            React.createElement(recharts_1.Bar, { dataKey: "VI", fill: option1_constants_1.MODEL_COLORS.Gemini, name: "Vietnamese", radius: [4, 4, 0, 0] }))))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Language Performance Gap Analysis")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("table", { className: "w-full text-xs" },
                        React.createElement("thead", { className: "bg-gray-50 dark:bg-slate-800" },
                            React.createElement("tr", null,
                                React.createElement("th", { className: "text-left py-3 px-4 font-semibold" }, "Model"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "EN Performance"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "VI Performance"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Gap"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Cross-Lingual Score"))),
                        React.createElement("tbody", { className: "bg-white dark:bg-slate-850" }, option1_data_1.languageComparison.map(function (item, idx) {
                            var gap = (item.EN - item.VI) * 100;
                            var crossLingualScore = item.VI / item.EN;
                            return (React.createElement("tr", { key: idx, className: "border-t border-gray-100 dark:border-slate-800" },
                                React.createElement("td", { className: "py-3 px-4" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("div", { className: "w-3 h-3 rounded", style: { backgroundColor: option1_constants_1.MODEL_COLORS[item.model] } }),
                                        React.createElement("span", { className: "font-semibold" }, item.model))),
                                React.createElement("td", { className: "py-3 px-4 text-center" },
                                    React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/20 font-mono font-semibold text-blue-700 dark:text-blue-400" },
                                        (item.EN * 100).toFixed(1),
                                        "%")),
                                React.createElement("td", { className: "py-3 px-4 text-center" },
                                    React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-green-50 dark:bg-green-950/20 font-mono font-semibold text-green-700 dark:text-green-400" },
                                        (item.VI * 100).toFixed(1),
                                        "%")),
                                React.createElement("td", { className: "py-3 px-4 text-center" },
                                    React.createElement("span", { className: "font-mono font-semibold " + (gap > 4 ? "text-red-600" : gap > 3 ? "text-orange-600" : "text-green-600") },
                                        "-",
                                        gap.toFixed(1),
                                        "%")),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono font-semibold" }, crossLingualScore.toFixed(3))));
                        }))),
                    React.createElement("p", { className: "text-xs text-gray-500 dark:text-slate-400 mt-3 italic" }, "Cross-Lingual Score = VI / EN (closer to 1.0 = better multilingual capability)"))))));
}
exports["default"] = TabLanguage;
