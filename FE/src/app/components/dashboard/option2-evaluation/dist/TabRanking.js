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
var option1_data_1 = require("../option1.data");
function TabRanking() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-3 gap-4" },
            React.createElement(card_1.Card, { className: "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "text-4xl mb-2" }, "\uD83E\uDD47"),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase mb-1" }, "Best Overall"),
                        React.createElement("p", { className: "text-lg font-bold" }, "Gemini EN 0.8"),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "91.5% Top-1")))),
            React.createElement(card_1.Card, { className: "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/20" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "text-4xl mb-2" }, "\uD83E\uDD48"),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase mb-1" }, "Best Balanced"),
                        React.createElement("p", { className: "text-lg font-bold" }, "GPT EN 0.8"),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "89.7% / 44ms")))),
            React.createElement(card_1.Card, { className: "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "text-4xl mb-2" }, "\uD83E\uDD49"),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase mb-1" }, "Fastest"),
                        React.createElement("p", { className: "text-lg font-bold" }, "Gemini EN 0.8"),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-slate-400 mt-1" }, "31ms latency"))))),
        React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Complete Ranking (All 18 Configurations)")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-auto max-h-[500px]" },
                    React.createElement("table", { className: "w-full text-xs" },
                        React.createElement("thead", { className: "bg-gray-50 dark:bg-slate-800 sticky top-0" },
                            React.createElement("tr", null,
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Rank"),
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Model"),
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Lang"),
                                React.createElement("th", { className: "text-left py-3 px-3 font-semibold" }, "Threshold"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "Top-1"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "MRR"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "NDCG"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "Latency"),
                                React.createElement("th", { className: "text-center py-3 px-3 font-semibold" }, "Score"))),
                        React.createElement("tbody", { className: "bg-white dark:bg-slate-850" }, __spreadArrays(option1_data_1.allConfigs).sort(function (a, b) { return b.top1 - a.top1; })
                            .map(function (config, idx) { return (React.createElement("tr", { key: idx, className: "border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 " + (idx < 3 ? "bg-amber-50/30 dark:bg-amber-950/10" : "") },
                            React.createElement("td", { className: "py-2 px-3" },
                                idx === 0 && React.createElement("span", { className: "text-lg" }, "\uD83E\uDD47"),
                                idx === 1 && React.createElement("span", { className: "text-lg" }, "\uD83E\uDD48"),
                                idx === 2 && React.createElement("span", { className: "text-lg" }, "\uD83E\uDD49"),
                                idx > 2 && React.createElement("span", { className: "font-mono text-gray-500" },
                                    "#",
                                    idx + 1)),
                            React.createElement("td", { className: "py-2 px-3 font-semibold" }, config.model),
                            React.createElement("td", { className: "py-2 px-3" }, config.language),
                            React.createElement("td", { className: "py-2 px-3 font-mono" }, config.threshold),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono font-semibold text-blue-700" },
                                (config.top1 * 100).toFixed(1),
                                "%"),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono" }, config.mrr.toFixed(3)),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono" }, config.ndcg.toFixed(3)),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono" },
                                config.latency,
                                "ms"),
                            React.createElement("td", { className: "py-2 px-3 text-center font-mono text-purple-700" }, (config.top1 * 0.7 + config.mrr * 0.3).toFixed(3)))); }))))))));
}
exports["default"] = TabRanking;
