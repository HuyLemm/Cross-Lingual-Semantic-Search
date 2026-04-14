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
var DatasetManagementHeader_1 = require("./dataset-management/DatasetManagementHeader");
var DatasetFilesStats_1 = require("./dataset-management/DatasetFilesStats");
var LanguageSelector_1 = require("./dataset-management/LanguageSelector");
var PDFFilesList_1 = require("./dataset-management/PDFFilesList");
var ProcessingPipeline_1 = require("./dataset-management/ProcessingPipeline");
var loading_spinner_1 = require("../ui/loading-spinner");
var API_BASE = "http://localhost:4000";
function DatasetManagement() {
    var _a = react_1.useState("english"), selectedLanguage = _a[0], setSelectedLanguage = _a[1];
    var _b = react_1.useState(null), stats = _b[0], setStats = _b[1];
    var _c = react_1.useState(false), loadingStats = _c[0], setLoadingStats = _c[1];
    react_1.useEffect(function () {
        var controller = new AbortController();
        var isCurrent = true;
        function load() {
            return __awaiter(this, void 0, void 0, function () {
                var res, data, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, 4, 5]);
                            setLoadingStats(true);
                            return [4 /*yield*/, fetch(API_BASE + "/dataset/stats", {
                                    cache: "no-store",
                                    signal: controller.signal
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error("HTTP " + res.status);
                            return [4 /*yield*/, res.json()];
                        case 2:
                            data = (_a.sent());
                            if (isCurrent)
                                setStats(data);
                            return [3 /*break*/, 5];
                        case 3:
                            e_1 = _a.sent();
                            if ((e_1 === null || e_1 === void 0 ? void 0 : e_1.name) !== "AbortError")
                                console.error("Failed to load dataset stats:", e_1);
                            if (isCurrent)
                                setStats(null);
                            return [3 /*break*/, 5];
                        case 4:
                            if (isCurrent)
                                setLoadingStats(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        load();
        return function () {
            isCurrent = false;
            controller.abort();
        };
    }, []);
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(DatasetManagementHeader_1["default"], null),
        loadingStats ? (React.createElement("div", { className: "flex justify-center py-6" },
            React.createElement(loading_spinner_1["default"], { size: 26 }))) : (React.createElement(DatasetFilesStats_1["default"], { stats: stats })),
        React.createElement(LanguageSelector_1["default"], { selectedLanguage: selectedLanguage, onLanguageChange: setSelectedLanguage }),
        React.createElement(PDFFilesList_1["default"], { selectedLanguage: selectedLanguage, apiBase: API_BASE }),
        React.createElement(ProcessingPipeline_1["default"], null)));
}
exports["default"] = DatasetManagement;
