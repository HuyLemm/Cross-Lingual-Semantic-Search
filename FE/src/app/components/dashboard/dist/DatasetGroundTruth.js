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
    var _l = react_1.useState(null), selectedQA = _l[0], setSelectedQA = _l[1];
    var _m = react_1.useState(false), isSheetOpen = _m[0], setIsSheetOpen = _m[1];
    /* ========================= SUMMARY METRICS ========================= */
    var _o = react_1.useState({
        totalDocuments: 0,
        totalQAPairs: 0,
        verifiedQAPairs: 0,
        avgBiEncoder: 0,
        avgCrossEncoder: 0,
        step1OnlyRate: 0,
        validationRate: 0
    }), metrics = _o[0], setMetrics = _o[1];
    /* =====================================================
     * RESET PAGE + CLEAR DATA WHEN FILTER CHANGES
     * ===================================================== */
    react_1.useEffect(function () {
        setPage(1);
        setQAList([]); // ⭐ tránh flash data cũ
    }, [selectedDataset, selectedModel, selectedExperiment, searchQuery]);
    /* =====================================================
     * RESET EXPERIMENT WHEN DATASET/MODEL CHANGES
     * ===================================================== */
    react_1.useEffect(function () {
        setSelectedExperiment("all");
    }, [selectedDataset, selectedModel]);
    /* =====================================================
     * FETCH QA LIST (WITH ABORT CONTROLLER)
     * ===================================================== */
    react_1.useEffect(function () {
        var controller = new AbortController();
        var signal = controller.signal;
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
        params.set("pageSize", "20");
        fetch("http://localhost:4000/summary/qa-list?" + params, { signal: signal })
            .then(function (res) { return res.json(); })
            .then(function (data) {
            setQAList(data.items || []);
            setQaTotal(data.total || 0);
        })["catch"](function (err) {
            if (err.name !== "AbortError")
                console.error(err);
        });
        return function () { return controller.abort(); }; // ⭐ kill request cũ
    }, [selectedDataset, selectedModel, selectedExperiment, searchQuery, page]);
    /* =====================================================
     * DATASET OVERVIEW (STATIC)
     * ===================================================== */
    react_1.useEffect(function () {
        fetch("http://localhost:4000/summary/dataset-overview")
            .then(function (res) { return res.json(); })
            .then(setDatasetOverview)["catch"](console.error);
    }, []);
    /* =====================================================
     * FETCH EXPERIMENT LIST
     * ===================================================== */
    react_1.useEffect(function () {
        if (!shouldShowExpList) {
            setAvailableExperiments([]);
            return;
        }
        var controller = new AbortController();
        fetch("http://localhost:4000/summary/experiments?model=" + selectedModel + "&dataset=" + selectedDataset, { signal: controller.signal })
            .then(function (res) { return res.json(); })
            .then(function (list) {
            var sorted = list.sort(function (a, b) { return Number(a.replace("exp", "")) - Number(b.replace("exp", "")); });
            setAvailableExperiments(sorted);
        })["catch"](function (err) {
            if (err.name !== "AbortError")
                console.error(err);
        });
        return function () { return controller.abort(); };
    }, [selectedModel, selectedDataset, shouldShowExpList]);
    /* =====================================================
     * FETCH SUMMARY METRICS
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
        });
        return function () { return controller.abort(); };
    }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);
    /* =====================================================
     * HANDLER
     * ===================================================== */
    var handleViewSource = function (qa) {
        setSelectedQA(qa);
        setIsSheetOpen(true);
    };
    /* =====================================================
     * RENDER
     * ===================================================== */
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(DatasetGroundTruthHeader_1["default"], { selectedDataset: selectedDataset, selectedModel: selectedModel, selectedExperiment: selectedExperiment, selectedQuality: selectedQuality, searchQuery: searchQuery, onDatasetChange: setSelectedDataset, onModelChange: setSelectedModel, onExperimentChange: setSelectedExperiment, availableExperiments: availableExperiments, shouldShowExpList: shouldShowExpList, onQualityChange: setSelectedQuality, onSearchChange: setSearchQuery }),
        React.createElement(ReliabilitySummaryCards_1["default"], __assign({}, metrics)),
        React.createElement(DatasetOverviewTable_1["default"], { datasets: datasetOverview }),
        React.createElement(QAPairValidationTable_1["default"], { qaPairs: qaList, totalQAPairs: qaTotal, onViewSource: handleViewSource }),
        React.createElement(TraceabilityVisualization_1["default"], null),
        React.createElement(ValidationLogicPanel_1["default"], null),
        React.createElement(SourceViewSheet_1["default"], { qa: selectedQA, isOpen: isSheetOpen, onClose: function () { return setIsSheetOpen(false); } })));
}
exports["default"] = DatasetGroundTruth;
