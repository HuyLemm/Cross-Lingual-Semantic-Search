"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var QAValidationHeader_1 = require("./qa-validation/QAValidationHeader");
var ReliabilitySummaryCards_1 = require("./qa-validation/ReliabilitySummaryCards");
var QAOverviewTable_1 = require("./qa-validation/QAOverviewTable");
var QAPairValidationTable_1 = require("./qa-validation/QAPairValidationTable");
var ValidationLogicPanel_1 = require("./qa-validation/ValidationLogicPanel");
var SourceViewSheet_1 = require("./qa-validation/SourceViewSheet");
var loading_spinner_1 = require("../ui/loading-spinner");
// ✅ PDF Modal
var QAPairPDFViewerModal_1 = require("./qa-validation/QAPairPDFViewerModal");
var API_BASE = "http://localhost:4000";
function resolveDatasetFolder(selectedDataset, qa) {
    if (selectedDataset === "articles_en" || selectedDataset === "articles_vi") {
        return selectedDataset;
    }
    var lang = (qa.language || "").toLowerCase();
    if (lang === "vi")
        return "articles_vi";
    return "articles_en";
}
function QAValidation() {
    var _this = this;
    /* ========================= FILTER STATES ========================= */
    var _a = react_1.useState("all"), selectedDataset = _a[0], setSelectedDataset = _a[1];
    var _b = react_1.useState("all"), selectedModel = _b[0], setSelectedModel = _b[1];
    var _c = react_1.useState("all"), selectedExperiment = _c[0], setSelectedExperiment = _c[1];
    var _d = react_1.useState("0.7"), selectedQuality = _d[0], setSelectedQuality = _d[1];
    var _e = react_1.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState([]), availableExperiments = _f[0], setAvailableExperiments = _f[1];
    var shouldShowExpList = selectedModel !== "all" && selectedDataset !== "all";
    /* ========================= DATA STATES ========================= */
    var _g = react_1.useState([]), datasetOverview = _g[0], setDatasetOverview = _g[1];
    var _h = react_1.useState([]), qaList = _h[0], setQAList = _h[1];
    var _j = react_1.useState(0), qaTotal = _j[0], setQaTotal = _j[1];
    var _k = react_1.useState(1), page = _k[0], setPage = _k[1];
    var PAGE_SIZE = 10;
    /* ========================= SHEET STATES (View button) ========================= */
    var _l = react_1.useState(null), selectedQA = _l[0], setSelectedQA = _l[1];
    var _m = react_1.useState(false), isSheetOpen = _m[0], setIsSheetOpen = _m[1];
    /* ========================= PDF MODAL STATES (Source badge) ========================= */
    var _o = react_1.useState(false), isPdfOpen = _o[0], setIsPdfOpen = _o[1];
    var _p = react_1.useState(null), pdfMeta = _p[0], setPdfMeta = _p[1];
    var _q = react_1.useState(false), pdfLoading = _q[0], setPdfLoading = _q[1];
    var _r = react_1.useState(null), pdfError = _r[0], setPdfError = _r[1];
    /* ========================= LOADING STATES ========================= */
    var _s = react_1.useState(false), loadingQA = _s[0], setLoadingQA = _s[1];
    var _t = react_1.useState(false), loadingMetrics = _t[0], setLoadingMetrics = _t[1];
    var _u = react_1.useState(false), loadingExperiments = _u[0], setLoadingExperiments = _u[1];
    var _v = react_1.useState(false), loadingOverview = _v[0], setLoadingOverview = _v[1];
    /* ========================= SUMMARY METRICS ========================= */
    var _w = react_1.useState({
        totalDocuments: 0,
        totalQAPairs: 0,
        verifiedQAPairs: 0,
        avgBiEncoder: 0,
        avgCrossEncoder: 0,
        step1OnlyRate: 0,
        validationRate: 0
    }), metrics = _w[0], setMetrics = _w[1];
    /* =====================================================
     * RESET PAGE WHEN FILTER CHANGES (KHÔNG reset theo searchQuery)
     * ===================================================== */
    react_1.useEffect(function () {
        setPage(1);
        setQAList([]);
    }, [selectedDataset, selectedModel, selectedExperiment]);
    /* =====================================================
     * RESET EXPERIMENT WHEN DATASET/MODEL CHANGES
     * ===================================================== */
    react_1.useEffect(function () {
        setSelectedExperiment("all");
    }, [selectedDataset, selectedModel]);
    /* =====================================================
     * SEARCH HANDLER: reset page ngay lập tức
     * ===================================================== */
    var handleSearchChange = function (v) {
        setSearchQuery(v);
        setPage(1);
        setQAList([]);
    };
    /* =====================================================
     * FETCH QA LIST
     * ===================================================== */
    react_1.useEffect(function () {
        var controller = new AbortController();
        var isCurrent = true;
        var params = new URLSearchParams();
        if (selectedDataset !== "all")
            params.set("dataset", selectedDataset);
        if (selectedModel !== "all")
            params.set("model", selectedModel);
        if (selectedExperiment !== "all")
            params.set("experiment", selectedExperiment);
        if (searchQuery)
            params.set("search", searchQuery);
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
        setLoadingQA(true);
        setQAList([]);
        fetch("http://localhost:4000/summary/qa-list?" + params, {
            signal: controller.signal
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
            var _a, _b;
            if (!isCurrent)
                return;
            setQAList(data.items || []);
            var total = (_b = (_a = data.totalQAPairs) !== null && _a !== void 0 ? _a : data.total) !== null && _b !== void 0 ? _b : 0;
            setQaTotal(total);
            var maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
            if (page > maxPage)
                setPage(maxPage);
        })["catch"](function (err) {
            if (err.name !== "AbortError" && isCurrent)
                console.error(err);
        })["finally"](function () {
            if (isCurrent)
                setLoadingQA(false);
        });
        return function () {
            isCurrent = false;
            controller.abort();
        };
    }, [selectedDataset, selectedModel, selectedExperiment, searchQuery, page]);
    /* =====================================================
     * DATASET OVERVIEW
     * ===================================================== */
    react_1.useEffect(function () {
        setLoadingOverview(true);
        fetch("http://localhost:4000/summary/dataset-overview")
            .then(function (res) { return res.json(); })
            .then(setDatasetOverview)["catch"](console.error)["finally"](function () { return setLoadingOverview(false); });
    }, [selectedQuality]);
    /* =====================================================
     * FETCH EXPERIMENT LIST
     * ===================================================== */
    react_1.useEffect(function () {
        if (!shouldShowExpList) {
            setAvailableExperiments([]);
            return;
        }
        var controller = new AbortController();
        setLoadingExperiments(true);
        fetch("http://localhost:4000/summary/experiments?model=" + selectedModel + "&dataset=" + selectedDataset, { signal: controller.signal })
            .then(function (res) { return res.json(); })
            .then(function (list) {
            var sorted = list.sort(function (a, b) { return Number(a.replace("exp", "")) - Number(b.replace("exp", "")); });
            setAvailableExperiments(sorted);
        })["catch"](function (err) {
            if (err.name !== "AbortError")
                console.error(err);
        })["finally"](function () { return setLoadingExperiments(false); });
        return function () { return controller.abort(); };
    }, [selectedModel, selectedDataset, shouldShowExpList]);
    /* =====================================================
     * FETCH METRICS
     * ===================================================== */
    react_1.useEffect(function () {
        var controller = new AbortController();
        var params = new URLSearchParams();
        if (selectedDataset !== "all")
            params.set("dataset", selectedDataset);
        if (selectedModel !== "all")
            params.set("model", selectedModel);
        if (selectedExperiment !== "all")
            params.set("experiment", selectedExperiment);
        if (selectedQuality !== "all")
            params.set("quality", selectedQuality);
        setLoadingMetrics(true);
        fetch("http://localhost:4000/summary/get-summary?" + params, {
            signal: controller.signal
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
            var _a, _b, _c, _d, _e, _f, _g;
            return setMetrics({
                totalDocuments: (_a = data.totalDocuments) !== null && _a !== void 0 ? _a : 0,
                totalQAPairs: (_b = data.totalQAPairs) !== null && _b !== void 0 ? _b : 0,
                verifiedQAPairs: (_c = data.verifiedQAPairs) !== null && _c !== void 0 ? _c : 0,
                avgBiEncoder: (_d = data.avgBiEncoder) !== null && _d !== void 0 ? _d : 0,
                avgCrossEncoder: (_e = data.avgCrossEncoder) !== null && _e !== void 0 ? _e : 0,
                step1OnlyRate: (_f = data.step1OnlyRate) !== null && _f !== void 0 ? _f : 0,
                validationRate: (_g = data.validationRate) !== null && _g !== void 0 ? _g : 0
            });
        })["catch"](function (err) {
            if (err.name !== "AbortError")
                console.error(err);
        })["finally"](function () { return setLoadingMetrics(false); });
        return function () { return controller.abort(); };
    }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);
    /* =====================================================
     * HANDLERS
     * ===================================================== */
    // ✅ View button -> Sheet
    var handleViewDetails = function (qa) {
        setSelectedQA(qa);
        setIsSheetOpen(true);
    };
    // ✅ Source badge -> PDF Modal
    var handleOpenPdf = function (qa) { return __awaiter(_this, void 0, void 0, function () {
        var datasetFolder, params, res, data, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("open pdf:", qa.sourceDocument, qa.chunk_id); // ✅ debug
                    setSelectedQA(qa);
                    setIsPdfOpen(true);
                    setPdfLoading(true);
                    setPdfError(null);
                    setPdfMeta(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    datasetFolder = resolveDatasetFolder(selectedDataset, qa);
                    params = new URLSearchParams();
                    params.set("dataset", datasetFolder);
                    params.set("pdf", (_a = qa.sourceDocument) !== null && _a !== void 0 ? _a : "");
                    if (qa.chunk_id)
                        params.set("chunk_id", String(qa.chunk_id));
                    return [4 /*yield*/, fetch(API_BASE + "/qa/doc-meta?" + params.toString())];
                case 2:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _b.sent();
                    if (!res.ok)
                        throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Failed to load PDF meta");
                    setPdfMeta(data);
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _b.sent();
                    setPdfError((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || "Failed to load PDF meta");
                    return [3 /*break*/, 6];
                case 5:
                    setPdfLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handlePageChange = function (newPage) {
        setPage(newPage);
    };
    var qualityThreshold = selectedQuality === "all" ? 0.7 : Number(selectedQuality);
    var globalLoading = loadingOverview || loadingMetrics || loadingExperiments;
    /* =====================================================
     * RENDER
     * ===================================================== */
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(QAValidationHeader_1["default"], { selectedDataset: selectedDataset, selectedModel: selectedModel, selectedExperiment: selectedExperiment, selectedQuality: selectedQuality, searchQuery: searchQuery, onDatasetChange: setSelectedDataset, onModelChange: setSelectedModel, onExperimentChange: setSelectedExperiment, availableExperiments: availableExperiments, shouldShowExpList: shouldShowExpList, onQualityChange: setSelectedQuality, onSearchChange: handleSearchChange }),
        loadingMetrics ? (React.createElement("div", { className: "flex justify-center py-6" },
            React.createElement(loading_spinner_1["default"], { size: 26 }))) : (React.createElement(ReliabilitySummaryCards_1["default"], __assign({}, metrics))),
        loadingOverview ? (React.createElement("div", { className: "flex justify-center py-6" },
            React.createElement(loading_spinner_1["default"], { size: 26 }))) : (React.createElement(QAOverviewTable_1["default"], { datasets: datasetOverview, threshold: qualityThreshold })),
        React.createElement(QAPairValidationTable_1["default"], { qaPairs: qaList, totalQAPairs: qaTotal, page: page, pageSize: PAGE_SIZE, qualityThreshold: qualityThreshold, searchQuery: searchQuery, loading: loadingQA, onSearchChange: handleSearchChange, onPageChange: handlePageChange, onOpenPdf: handleOpenPdf, onViewDetails: handleViewDetails }),
        React.createElement(ValidationLogicPanel_1["default"], null),
        React.createElement(SourceViewSheet_1["default"], { qa: selectedQA, isOpen: isSheetOpen, onClose: function () { return setIsSheetOpen(false); }, threshold: qualityThreshold, searchQuery: searchQuery }),
        isPdfOpen && selectedQA && (React.createElement(QAPairPDFViewerModal_1["default"], { qa: selectedQA, meta: pdfMeta, loading: pdfLoading, error: pdfError, onClose: function () {
                setIsPdfOpen(false);
                setPdfMeta(null);
                setPdfError(null);
            } })),
        globalLoading && (React.createElement("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" },
            React.createElement("div", { className: "bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg" },
                React.createElement(loading_spinner_1["default"], { size: 32 }),
                React.createElement("p", { className: "text-sm text-gray-500 mt-2 text-center" }, "Loading data..."))))));
}
exports["default"] = QAValidation;
