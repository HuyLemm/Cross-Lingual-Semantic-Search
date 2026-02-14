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
exports.__esModule = true;
var react_1 = require("react");
var DatasetGroundTruthHeader_1 = require("./dataset-ground-truth/DatasetGroundTruthHeader");
var ReliabilitySummaryCards_1 = require("./dataset-ground-truth/ReliabilitySummaryCards");
var DatasetOverviewTable_1 = require("./dataset-ground-truth/DatasetOverviewTable");
var QAPairValidationTable_1 = require("./dataset-ground-truth/QAPairValidationTable");
var TraceabilityVisualization_1 = require("./dataset-ground-truth/TraceabilityVisualization");
var ValidationLogicPanel_1 = require("./dataset-ground-truth/ValidationLogicPanel");
var SourceViewSheet_1 = require("./dataset-ground-truth/SourceViewSheet");
var loading_spinner_1 = require("../ui/loading-spinner");
function DatasetGroundTruth() {
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
    var _l = react_1.useState(null), selectedQA = _l[0], setSelectedQA = _l[1];
    var _m = react_1.useState(false), isSheetOpen = _m[0], setIsSheetOpen = _m[1];
    /* ========================= LOADING STATES ========================= */
    var _o = react_1.useState(false), loadingQA = _o[0], setLoadingQA = _o[1];
    var _p = react_1.useState(false), loadingMetrics = _p[0], setLoadingMetrics = _p[1];
    var _q = react_1.useState(false), loadingExperiments = _q[0], setLoadingExperiments = _q[1];
    var _r = react_1.useState(false), loadingOverview = _r[0], setLoadingOverview = _r[1];
    /* ========================= SUMMARY METRICS ========================= */
    var _s = react_1.useState({
        totalDocuments: 0,
        totalQAPairs: 0,
        verifiedQAPairs: 0,
        avgBiEncoder: 0,
        avgCrossEncoder: 0,
        step1OnlyRate: 0,
        validationRate: 0
    }), metrics = _s[0], setMetrics = _s[1];
    /* =====================================================
     * RESET PAGE WHEN FILTER CHANGES
     * ===================================================== */
    react_1.useEffect(function () {
        setPage(1);
        setQAList([]);
    }, [selectedDataset, selectedModel, selectedExperiment, searchQuery]);
    /* =====================================================
     * RESET EXPERIMENT WHEN DATASET/MODEL CHANGES
     * ===================================================== */
    react_1.useEffect(function () {
        setSelectedExperiment("all");
    }, [selectedDataset, selectedModel]);
    /* =====================================================
     * FETCH QA LIST
     * ===================================================== */
    react_1.useEffect(function () {
        var controller = new AbortController();
        var isCurrent = true; // 👈 guard request mới nhất
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
        setQAList([]); // clear ngay khi fetch start
        fetch("http://localhost:4000/summary/qa-list?" + params, {
            signal: controller.signal
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
            if (!isCurrent)
                return; // 👈 ignore stale response
            setQAList(data.items || []);
            setQaTotal(data.total || 0);
            var maxPage = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
            if (page > maxPage)
                setPage(maxPage);
        })["catch"](function (err) {
            if (err.name !== "AbortError" && isCurrent) {
                console.error(err);
            }
        })["finally"](function () {
            if (isCurrent)
                setLoadingQA(false); // 👈 chỉ request mới nhất mới tắt loading
        });
        return function () {
            isCurrent = false; // 👈 mark request cũ
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
    var handleViewSource = function (qa) {
        setSelectedQA(qa);
        setIsSheetOpen(true);
    };
    var handlePageChange = function (newPage) {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    var qualityThreshold = selectedQuality === "all" ? 0.7 : Number(selectedQuality);
    var globalLoading = loadingOverview || loadingMetrics || loadingExperiments;
    /* =====================================================
     * RENDER
     * ===================================================== */
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(DatasetGroundTruthHeader_1["default"], { selectedDataset: selectedDataset, selectedModel: selectedModel, selectedExperiment: selectedExperiment, selectedQuality: selectedQuality, searchQuery: searchQuery, onDatasetChange: setSelectedDataset, onModelChange: setSelectedModel, onExperimentChange: setSelectedExperiment, availableExperiments: availableExperiments, shouldShowExpList: shouldShowExpList, onQualityChange: setSelectedQuality, onSearchChange: setSearchQuery }),
        loadingMetrics ? (React.createElement("div", { className: "flex justify-center py-6" },
            React.createElement(loading_spinner_1["default"], { size: 26 }))) : (React.createElement(ReliabilitySummaryCards_1["default"], __assign({}, metrics))),
        loadingOverview ? (React.createElement("div", { className: "flex justify-center py-6" },
            React.createElement(loading_spinner_1["default"], { size: 26 }))) : (React.createElement(DatasetOverviewTable_1["default"], { datasets: datasetOverview, threshold: qualityThreshold })),
        React.createElement(QAPairValidationTable_1["default"], { qaPairs: qaList, totalQAPairs: qaTotal, page: page, pageSize: PAGE_SIZE, qualityThreshold: qualityThreshold, searchQuery: searchQuery, loading: loadingQA, onSearchChange: setSearchQuery, onPageChange: handlePageChange, onViewSource: handleViewSource }),
        React.createElement(TraceabilityVisualization_1["default"], null),
        React.createElement(ValidationLogicPanel_1["default"], null),
        React.createElement(SourceViewSheet_1["default"], { qa: selectedQA, isOpen: isSheetOpen, onClose: function () { return setIsSheetOpen(false); }, threshold: qualityThreshold, searchQuery: searchQuery }),
        globalLoading && (React.createElement("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" },
            React.createElement("div", { className: "bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg" },
                React.createElement(loading_spinner_1["default"], { size: 32 }),
                React.createElement("p", { className: "text-sm text-gray-500 mt-2 text-center" }, "Loading data..."))))));
}
exports["default"] = DatasetGroundTruth;
