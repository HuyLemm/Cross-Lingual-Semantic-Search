// app/(whatever)/qa-eval/QAEvaluation.tsx
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
var framer_motion_1 = require("framer-motion");
var ModelSection_1 = require("./qa-evaluation/ModelSection");
var QAEvaluationHeader_1 = require("./qa-evaluation/QAEvaluationHeader");
var CrossModelComparison_1 = require("./qa-evaluation/CrossModelComparison");
var API_BASE = "http://localhost:4000";
function QAEvaluation() {
    var _a = react_1.useState("gpt-5.2"), selectedModel = _a[0], setSelectedModel = _a[1];
    var _b = react_1.useState("0.7"), quality = _b[0], setQuality = _b[1]; // ✅ default 0.7
    var _c = react_1.useState(null), data = _c[0], setData = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(null), error = _e[0], setError = _e[1];
    var dataset = "all";
    var experiment = "all";
    var requestUrl = react_1.useMemo(function () {
        var params = new URLSearchParams();
        params.set("modelId", selectedModel);
        params.set("threshold", quality); // ✅ dùng quality
        params.set("dataset", dataset);
        params.set("experiment", experiment);
        return API_BASE + "/qa-eval/model-section?" + params.toString();
    }, [selectedModel, quality, dataset, experiment]);
    react_1.useEffect(function () {
        var cancelled = false;
        function load() {
            return __awaiter(this, void 0, void 0, function () {
                var res, txt, json, err_1;
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
                            json = _a.sent();
                            if (!cancelled) {
                                setData(json);
                            }
                            return [3 /*break*/, 7];
                        case 5:
                            err_1 = _a.sent();
                            if (!cancelled) {
                                setError((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "Failed to load model data");
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
    return (React.createElement("div", { className: "h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900" },
        React.createElement("div", { className: "p-8 space-y-8" },
            React.createElement(QAEvaluationHeader_1["default"], { selectedModel: selectedModel, setSelectedModel: setSelectedModel, quality: quality, setQuality: setQuality }),
            loading && (React.createElement("div", { className: "flex items-center justify-center py-16" },
                React.createElement("div", { className: "flex flex-col items-center gap-4" },
                    React.createElement("div", { className: "w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" }),
                    React.createElement("p", { className: "text-sm text-gray-600 dark:text-slate-400" }, "Loading model evaluation...")))),
            error && (React.createElement("div", { className: "rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-6" },
                React.createElement("p", { className: "text-sm font-semibold text-red-700 dark:text-red-300" }, "Failed to load data"),
                React.createElement("p", { className: "text-xs mt-2 text-red-600 dark:text-red-300/80 break-all" }, error))),
            React.createElement(framer_motion_1.AnimatePresence, { mode: "wait" }, !loading && !error && data && (React.createElement(ModelSection_1["default"], { key: selectedModel + "-" + quality, modelId: selectedModel, data: data }))),
            React.createElement(CrossModelComparison_1["default"], { quality: quality }))));
}
exports["default"] = QAEvaluation;
