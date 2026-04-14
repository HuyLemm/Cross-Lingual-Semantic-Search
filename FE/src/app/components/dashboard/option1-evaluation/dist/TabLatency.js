"use strict";
exports.__esModule = true;
var card_1 = require("@/app/components/ui/card");
var recharts_1 = require("recharts");
var option1_constants_1 = require("../option1.constants");
var option1_data_1 = require("../option1.data");
function TabLatency() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-2 gap-6" },
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Latency vs Accuracy Scatter Plot")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.ScatterChart, null,
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", opacity: 0.5 }),
                            React.createElement(recharts_1.XAxis, { dataKey: "x", name: "Latency", unit: "ms", tick: { fontSize: 11 }, label: { value: "Latency (ms)", position: "insideBottom", offset: -5, fontSize: 11 } }),
                            React.createElement(recharts_1.YAxis, { dataKey: "y", name: "Top-1", domain: [0.75, 1], tick: { fontSize: 11 }, label: { value: "Top-1 Accuracy", angle: -90, position: "insideLeft", fontSize: 11 } }),
                            React.createElement(recharts_1.Tooltip, { cursor: { strokeDasharray: "3 3" }, content: function (_a) {
                                    var active = _a.active, payload = _a.payload;
                                    if (active && payload && payload.length) {
                                        var data = payload[0].payload;
                                        return (React.createElement("div", { className: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 shadow-lg" },
                                            React.createElement("p", { className: "text-xs font-semibold" }, data.name),
                                            React.createElement("p", { className: "text-xs" },
                                                "Latency: ",
                                                data.x,
                                                "ms"),
                                            React.createElement("p", { className: "text-xs" },
                                                "Top-1: ",
                                                (data.y * 100).toFixed(1),
                                                "%")));
                                    }
                                    return null;
                                } }),
                            React.createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "11px" }, iconSize: 10 }),
                            React.createElement(recharts_1.Scatter, { name: "DeepSeek", data: option1_data_1.scatterDataByModel.DeepSeek, fill: option1_constants_1.MODEL_COLORS.DeepSeek, shape: "circle" }),
                            React.createElement(recharts_1.Scatter, { name: "Gemini", data: option1_data_1.scatterDataByModel.Gemini, fill: option1_constants_1.MODEL_COLORS.Gemini, shape: "triangle" }),
                            React.createElement(recharts_1.Scatter, { name: "GPT", data: option1_data_1.scatterDataByModel.GPT, fill: option1_constants_1.MODEL_COLORS.GPT, shape: "diamond" }))),
                    React.createElement("p", { className: "text-xs text-gray-500 dark:text-slate-400 mt-2 text-center italic" }, "Different shapes indicate different models \u2022 Lower-right corner is optimal (low latency, high accuracy)"))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Efficiency Score Table")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("table", { className: "w-full text-xs" },
                        React.createElement("thead", { className: "bg-gray-50 dark:bg-slate-800" },
                            React.createElement("tr", null,
                                React.createElement("th", { className: "text-left py-3 px-4 font-semibold" }, "Model"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Avg Latency"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Top-1"),
                                React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Efficiency"))),
                        React.createElement("tbody", { className: "bg-white dark:bg-slate-850" },
                            React.createElement("tr", { className: "border-t border-gray-100 dark:border-slate-800" },
                                React.createElement("td", { className: "py-3 px-4" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("div", { className: "w-3 h-3 rounded", style: { backgroundColor: option1_constants_1.MODEL_COLORS.DeepSeek } }),
                                        React.createElement("span", { className: "font-semibold" }, "DeepSeek"))),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono" }, "40ms"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono" }, "85.3%"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-green-600 font-semibold" }, "2.13")),
                            React.createElement("tr", { className: "border-t border-gray-100 dark:border-slate-800 bg-green-50/30 dark:bg-green-950/10" },
                                React.createElement("td", { className: "py-3 px-4" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("div", { className: "w-3 h-3 rounded", style: { backgroundColor: option1_constants_1.MODEL_COLORS.Gemini } }),
                                        React.createElement("span", { className: "font-semibold" }, "Gemini"))),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono" }, "36ms"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono" }, "88.4%"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-green-600 font-bold" }, "2.46 \u2B50")),
                            React.createElement("tr", { className: "border-t border-gray-100 dark:border-slate-800" },
                                React.createElement("td", { className: "py-3 px-4" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("div", { className: "w-3 h-3 rounded", style: { backgroundColor: option1_constants_1.MODEL_COLORS.GPT } }),
                                        React.createElement("span", { className: "font-semibold" }, "GPT"))),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono" }, "50ms"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono" }, "86.8%"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-blue-600" }, "1.74")))),
                    React.createElement("p", { className: "text-xs text-gray-500 dark:text-slate-400 mt-3 italic" }, "Efficiency Score = (Top-1 Accuracy) / (Latency in ms) \u00D7 100"))))));
}
exports["default"] = TabLatency;
