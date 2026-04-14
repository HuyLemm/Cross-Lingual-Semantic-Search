"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("../../ui/card");
var badge_1 = require("../../ui/badge");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var API_BASE = "http://localhost:4000";
function CrossModelComparison(_a) {
    var _b, _c;
    var quality = _a.quality;
    var _d = react_1.useState(null), data = _d[0], setData = _d[1];
    var _e = react_1.useState(false), loading = _e[0], setLoading = _e[1];
    var _f = react_1.useState(null), error = _f[0], setError = _f[1];
    // match với các controls hiện tại:
    var dataset = "all";
    var experiment = "all";
    var requestUrl = react_1.useMemo(function () {
        var params = new URLSearchParams();
        params.set("dataset", dataset);
        params.set("experiment", experiment);
        params.set("threshold", quality);
        return API_BASE + "/qa-eval/cross-model?" + params.toString();
    }, [dataset, experiment, quality]);
    react_1.useEffect(function () {
        var cancelled = false;
        function load() {
            return __awaiter(this, void 0, void 0, function () {
                var res, txt, json, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, 6, 7]);
                            setLoading(true);
                            setError(null);
                            return [4 /*yield*/, fetch(requestUrl, { cache: "no-store" })];
                        case 1:
                            res = _a.sent();
                            if (!!res.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, res.text()["catch"](function () { return ""; })];
                        case 2:
                            txt = _a.sent();
                            throw new Error(txt || "HTTP " + res.status);
                        case 3: return [4 /*yield*/, res.json()];
                        case 4:
                            json = (_a.sent());
                            if (!cancelled)
                                setData(json);
                            return [3 /*break*/, 7];
                        case 5:
                            e_1 = _a.sent();
                            if (!cancelled) {
                                setError((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || "Failed to load cross-model data");
                                setData(null);
                            }
                            return [3 /*break*/, 7];
                        case 6:
                            if (!cancelled)
                                setLoading(false);
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }
        load();
        return function () {
            cancelled = true;
        };
    }, [requestUrl]);
    var crossModelComparison = (_b = data === null || data === void 0 ? void 0 : data.crossModelComparison) !== null && _b !== void 0 ? _b : [];
    var radarComparisonData = (_c = data === null || data === void 0 ? void 0 : data.radarComparisonData) !== null && _c !== void 0 ? _c : [];
    var thLabel = Number(quality !== null && quality !== void 0 ? quality : 0.8).toFixed(2);
    return (React.createElement("div", { className: "border-t-2 border-gray-300 dark:border-slate-700 pt-8 mt-8" },
        React.createElement("div", { className: "flex items-center justify-between mb-6" },
            React.createElement("h3", { className: "text-xl font-bold text-gray-900 dark:text-slate-100" }, "Cross-Model Comparison"),
            React.createElement(badge_1.Badge, { className: "\r\n            inline-flex items-center gap-1.5\r\n            bg-emerald-50 text-emerald-700 border border-emerald-200\r\n            dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40\r\n            px-3 py-1 rounded-full text-sm font-semibold\r\n            shadow-sm\r\n          " },
                React.createElement(lucide_react_1.ShieldCheck, { className: "w-3.5 h-3.5" }),
                "Verified QA Only",
                React.createElement("span", { className: "opacity-70" }, "\u2022"),
                "t \u2265 ",
                thLabel)),
        loading && (React.createElement("div", { className: "flex items-center justify-center py-16" },
            React.createElement("div", { className: "flex flex-col items-center gap-4" },
                React.createElement("div", { className: "w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" }),
                React.createElement("p", { className: "text-sm text-gray-600 dark:text-slate-400" }, "Loading cross-model comparison...")))),
        error && (React.createElement("div", { className: "py-6 text-sm text-red-600 dark:text-red-400 break-all" }, error)),
        !loading && !error && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "grid grid-cols-2 gap-6 mb-6" },
                React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Model Performance Comparison")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: crossModelComparison },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", opacity: 0.5 }),
                                React.createElement(recharts_1.XAxis, { dataKey: "model", stroke: "#6b7280", tick: { fontSize: 11 } }),
                                React.createElement(recharts_1.YAxis, { stroke: "#6b7280", tick: { fontSize: 11 }, domain: [0, 100] }),
                                React.createElement(recharts_1.Tooltip, { contentStyle: {
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "11px"
                                    } }),
                                React.createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "11px" }, iconSize: 10 }),
                                React.createElement(recharts_1.Bar, { dataKey: "verified", fill: "#a855f7", name: "Verified %", radius: [4, 4, 0, 0] }),
                                React.createElement(recharts_1.Bar, { dataKey: "enVerified", fill: "#3b82f6", name: "EN Verified %", radius: [4, 4, 0, 0] }),
                                React.createElement(recharts_1.Bar, { dataKey: "viVerified", fill: "#10b981", name: "VI Verified %", radius: [4, 4, 0, 0] }))))),
                React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Multidimensional Model Analysis")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.RadarChart, { data: radarComparisonData },
                                React.createElement(recharts_1.PolarGrid, { stroke: "#e5e7eb" }),
                                React.createElement(recharts_1.PolarAngleAxis, { dataKey: "metric", tick: { fontSize: 10, fill: "#6b7280" } }),
                                React.createElement(recharts_1.PolarRadiusAxis, { angle: 90, domain: [0, 1], tick: { fontSize: 9, fill: "#6b7280" } }),
                                React.createElement(recharts_1.Radar, { name: "GPT-5.2", dataKey: "GPT-5.2", stroke: "#f59e0b", fill: "#f59e0b", fillOpacity: 0.2 }),
                                React.createElement(recharts_1.Radar, { name: "Gemini 2.5", dataKey: "Gemini 2.5", stroke: "#3b82f6", fill: "#3b82f6", fillOpacity: 0.2 }),
                                React.createElement(recharts_1.Radar, { name: "DeepSeek R1T2", dataKey: "DeepSeek R1T2", stroke: "#a855f7", fill: "#a855f7", fillOpacity: 0.2 }),
                                React.createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "11px" }, iconSize: 10 }),
                                React.createElement(recharts_1.Tooltip, { contentStyle: {
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "11px"
                                    } })))))),
            React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold text-gray-700 dark:text-slate-300" }, "Detailed Model Comparison")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-hidden border border-gray-200 dark:border-slate-700 rounded-xl" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", { className: "bg-gray-50 dark:bg-slate-800" },
                                React.createElement("tr", null,
                                    React.createElement("th", { className: "text-left py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "Model"),
                                    React.createElement("th", { className: "text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "Total QA"),
                                    React.createElement("th", { className: "text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "Avg Similarity"),
                                    React.createElement("th", { className: "text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "Avg Entailment"),
                                    React.createElement("th", { className: "text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "Verified %"),
                                    React.createElement("th", { className: "text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "EN Verified %"),
                                    React.createElement("th", { className: "text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold" }, "VI Verified %"))),
                            React.createElement("tbody", { className: "bg-white dark:bg-slate-850" }, crossModelComparison.map(function (row, idx) { return (React.createElement("tr", { key: idx, className: "border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50" },
                                React.createElement("td", { className: "py-3 px-4" },
                                    React.createElement("span", { className: "font-semibold text-gray-900 dark:text-slate-100" }, row.model)),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-gray-900 dark:text-slate-100" }, row.totalQA),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-blue-700 dark:text-blue-400 font-semibold" }, row.avgSimilarity.toFixed(3)),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-green-700 dark:text-green-400 font-semibold" }, row.avgEntailment.toFixed(3)),
                                React.createElement("td", { className: "py-3 px-4 text-center" },
                                    React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/20 font-mono text-xs font-semibold text-purple-700 dark:text-purple-400" },
                                        row.verified.toFixed(1),
                                        "%")),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-gray-700 dark:text-slate-300 text-xs" },
                                    row.enVerified.toFixed(1),
                                    "%"),
                                React.createElement("td", { className: "py-3 px-4 text-center font-mono text-gray-700 dark:text-slate-300 text-xs" },
                                    row.viVerified.toFixed(1),
                                    "%"))); }))))))))));
}
exports["default"] = CrossModelComparison;
