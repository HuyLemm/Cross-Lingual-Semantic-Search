"use strict";
exports.__esModule = true;
var react_1 = require("react");
var DatasetGroundTruthHeader_1 = require("./dataset-ground-truth/DatasetGroundTruthHeader");
var ReliabilitySummaryCards_1 = require("./dataset-ground-truth/ReliabilitySummaryCards");
var DatasetOverviewTable_1 = require("./dataset-ground-truth/DatasetOverviewTable");
var QAPairValidationTable_1 = require("./dataset-ground-truth/QAPairValidationTable");
var TraceabilityVisualization_1 = require("./dataset-ground-truth/TraceabilityVisualization");
var ValidationLogicPanel_1 = require("./dataset-ground-truth/ValidationLogicPanel");
var SourceViewSheet_1 = require("./dataset-ground-truth/SourceViewSheet");
var datasetGroundTruthData_1 = require("./dataset-ground-truth/datasetGroundTruthData");
function DatasetGroundTruth() {
    var _a = react_1.useState("all"), selectedDataset = _a[0], setSelectedDataset = _a[1];
    var _b = react_1.useState("all"), selectedModel = _b[0], setSelectedModel = _b[1];
    var _c = react_1.useState("all"), selectedExperiment = _c[0], setSelectedExperiment = _c[1];
    var _d = react_1.useState("0.7"), selectedQuality = _d[0], setSelectedQuality = _d[1];
    var _e = react_1.useState([]), availableExperiments = _e[0], setAvailableExperiments = _e[1];
    var _f = react_1.useState([]), datasetOverview = _f[0], setDatasetOverview = _f[1];
    var _g = react_1.useState(""), searchQuery = _g[0], setSearchQuery = _g[1];
    var _h = react_1.useState(null), selectedQA = _h[0], setSelectedQA = _h[1];
    var _j = react_1.useState(false), isSheetOpen = _j[0], setIsSheetOpen = _j[1];
    var shouldShowExpList = selectedModel !== "all" && selectedDataset !== "all";
    // =========================
    // SUMMARY METRICS (FROM BACKEND)
    // =========================
    var _k = react_1.useState({
        totalDocuments: 0,
        totalQAPairs: 0,
        verifiedQAPairs: 0,
        avgBiEncoder: 0,
        avgCrossEncoder: 0,
        step1OnlyRate: 0,
        validationRate: 0
    }), metrics = _k[0], setMetrics = _k[1];
    react_1.useEffect(function () {
        var params = new URLSearchParams();
        if (selectedDataset !== "all")
            params.set("dataset", selectedDataset);
        if (selectedModel !== "all")
            params.set("model", selectedModel);
        if (selectedExperiment !== "all")
            params.set("experiment", selectedExperiment);
        if (selectedQuality !== "all")
            params.set("quality", selectedQuality);
        fetch("http://localhost:4000/summary/dataset-overview?" + params)
            .then(function (res) { return res.json(); })
            .then(function (data) { return setDatasetOverview(data); })["catch"](function (err) { return console.error("Failed to fetch dataset overview", err); });
    }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);
    react_1.useEffect(function () {
        if (!shouldShowExpList) {
            setAvailableExperiments([]);
            setSelectedExperiment("all");
            return;
        }
        fetch("http://localhost:4000/summary/experiments?model=" + selectedModel + "&dataset=" + selectedDataset)
            .then(function (res) { return res.json(); })
            .then(function (list) {
            var sorted = list.sort(function (a, b) {
                var na = Number(a.replace("exp", ""));
                var nb = Number(b.replace("exp", ""));
                return na - nb;
            });
            setAvailableExperiments(sorted);
            if (!sorted.includes(selectedExperiment)) {
                setSelectedExperiment("all");
            }
        })["catch"](console.error);
    }, [selectedModel, selectedDataset]);
    // =========================
    // FETCH SUMMARY
    // =========================
    react_1.useEffect(function () {
        var query = buildSummaryQuery({
            dataset: selectedDataset,
            model: selectedModel,
            experiment: selectedExperiment,
            quality: selectedQuality
        });
        fetch("http://localhost:4000/summary/get-summary?" + query)
            .then(function (res) { return res.json(); })
            .then(function (data) {
            var _a, _b, _c, _d, _e, _f, _g;
            setMetrics({
                totalDocuments: (_a = data.totalDocuments) !== null && _a !== void 0 ? _a : 0,
                totalQAPairs: (_b = data.totalQAPairs) !== null && _b !== void 0 ? _b : 0,
                verifiedQAPairs: (_c = data.verifiedQAPairs) !== null && _c !== void 0 ? _c : 0,
                avgBiEncoder: (_d = data.avgBiEncoder) !== null && _d !== void 0 ? _d : 0,
                avgCrossEncoder: (_e = data.avgCrossEncoder) !== null && _e !== void 0 ? _e : 0,
                step1OnlyRate: (_f = data.step1OnlyRate) !== null && _f !== void 0 ? _f : 0,
                validationRate: (_g = data.validationRate) !== null && _g !== void 0 ? _g : 0
            });
        })["catch"](function (err) {
            console.error("Failed to fetch summary", err);
        });
    }, [selectedDataset, selectedModel, selectedExperiment, selectedQuality]);
    // =========================
    // FILTER TABLE (LOCAL MOCK)
    // =========================
    var filteredQAPairs = react_1.useMemo(function () {
        return datasetGroundTruthData_1.mockQAPairs.filter(function (qa) {
            var matchesDataset = selectedDataset === "all" ||
                (selectedDataset === "vjol" && qa.language === "vi") ||
                (selectedDataset === "semantic_scholar" && qa.language === "en");
            var matchesModel = selectedModel === "all" || qa.model === selectedModel;
            var matchesSearch = searchQuery === "" ||
                qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                qa.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                qa.source_pdf.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesDataset && matchesModel && matchesSearch;
        });
    }, [selectedDataset, selectedModel, searchQuery]);
    var handleViewSource = function (qa) {
        setSelectedQA(qa);
        setIsSheetOpen(true);
    };
    // =========================
    // BUILD QUERY FOR SUMMARY
    // =========================
    function buildSummaryQuery(_a) {
        var dataset = _a.dataset, model = _a.model, experiment = _a.experiment, quality = _a.quality;
        var params = new URLSearchParams();
        if (dataset !== "all")
            params.set("dataset", dataset);
        if (model !== "all")
            params.set("model", model);
        if (experiment !== "all")
            params.set("experiment", experiment);
        if (quality !== "all")
            params.set("quality", quality);
        return params.toString();
    }
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement(DatasetGroundTruthHeader_1["default"], { selectedDataset: selectedDataset, selectedModel: selectedModel, selectedExperiment: selectedExperiment, selectedQuality: selectedQuality, searchQuery: searchQuery, onDatasetChange: setSelectedDataset, onModelChange: setSelectedModel, onExperimentChange: setSelectedExperiment, availableExperiments: availableExperiments, shouldShowExpList: shouldShowExpList, onQualityChange: setSelectedQuality, onSearchChange: setSearchQuery }),
        React.createElement(ReliabilitySummaryCards_1["default"], { totalDocuments: metrics.totalDocuments, totalQAPairs: metrics.totalQAPairs, verifiedQAPairs: metrics.verifiedQAPairs, avgBiEncoder: metrics.avgBiEncoder, avgCrossEncoder: metrics.avgCrossEncoder, validationRate: metrics.validationRate, step1OnlyRate: metrics.step1OnlyRate }),
        React.createElement(DatasetOverviewTable_1["default"], { datasets: datasetOverview }),
        React.createElement(QAPairValidationTable_1["default"], { qaPairs: filteredQAPairs, totalQAPairs: metrics.totalQAPairs, onViewSource: handleViewSource }),
        React.createElement(TraceabilityVisualization_1["default"], null),
        React.createElement(ValidationLogicPanel_1["default"], null),
        React.createElement(SourceViewSheet_1["default"], { qa: selectedQA, isOpen: isSheetOpen, onClose: function () { return setIsSheetOpen(false); } })));
}
exports["default"] = DatasetGroundTruth;
