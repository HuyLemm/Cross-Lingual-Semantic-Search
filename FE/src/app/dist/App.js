"use strict";
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("../app/components/ui/button");
var lucide_react_1 = require("lucide-react");
var OverviewSummary_1 = require("../app/components/workbench/OverviewSummary");
var QAValidation_1 = require("../app/components/dashboard/QAValidation");
var QAEvaluation_1 = require("../app/components/dashboard/QAEvaluation");
var Option1Evaluation_1 = require("../app/components/dashboard/Option1Evaluation");
var Option2Evaluation_1 = require("../app/components/dashboard/Option2Evaluation");
var ModelComparison_1 = require("../app/components/dashboard/ModelComparison");
var IndexingChunking_1 = require("../app/components/dashboard/IndexingChunking");
var VectorDatabaseEvaluation_1 = require("../app/components/dashboard/VectorDatabaseEvaluation");
var ErrorAnalysis_1 = require("../app/components/dashboard/ErrorAnalysis");
var ExperimentLogs_1 = require("../app/components/dashboard/ExperimentLogs");
var Settings_1 = require("../app/components/dashboard/Settings");
var SearchQATesting_1 = require("../app/components/dashboard/SearchQATesting");
var DatasetManagement_1 = require("../app/components/dashboard/DatasetManagement");
function App() {
    var _a = react_1.useState("workbench"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = react_1.useState(false), darkMode = _b[0], setDarkMode = _b[1];
    var tabs = [
        { id: "workbench", label: "Experiment Playground", group: "control" },
        { id: "overview", label: "Evaluation Overview", group: "control" },
        { id: "dataset-management", label: "Dataset Management", group: "data" },
        { id: "qa-validation", label: "QA Validation", group: "data" },
        { id: "qa-evaluation", label: "QA Evaluation", group: "data" },
        { id: "option1Eval", label: "Baseline Results", group: "model" },
        { id: "option2Eval", label: "Advanced Results", group: "model" },
        { id: "comparison", label: "Comparative Analysis", group: "model" },
        { id: "indexing", label: "Indexing & Chunking", group: "system" },
        { id: "vectordb", label: "Vector Database", group: "system" },
        { id: "error", label: "Error Analysis", group: "evaluation" },
        { id: "logs", label: "Experiment Logs", group: "evaluation" },
        { id: "settings", label: "Settings", group: "evaluation" },
    ];
    var handleExport = function (format) {
        console.log("Exporting data as " + format);
        // Mock export functionality
    };
    var renderTabContent = function () {
        switch (activeTab) {
            case "workbench":
                return React.createElement(SearchQATesting_1["default"], null);
            case "overview":
                return React.createElement(OverviewSummary_1["default"], null);
            case "dataset-management":
                return React.createElement(DatasetManagement_1["default"], null);
            case "qa-validation":
                return React.createElement(QAValidation_1["default"], null);
            case "qa-evaluation":
                return React.createElement(QAEvaluation_1["default"], null);
            case 'option1Eval':
                return React.createElement(Option1Evaluation_1["default"], null);
            case 'option2Eval':
                return React.createElement(Option2Evaluation_1["default"], null);
            case 'comparison':
                return React.createElement(ModelComparison_1["default"], null);
            case "indexing":
                return React.createElement(IndexingChunking_1["default"], null);
            case "vectordb":
                return React.createElement(VectorDatabaseEvaluation_1["default"], null);
            case "error":
                return React.createElement(ErrorAnalysis_1["default"], null);
            case "logs":
                return React.createElement(ExperimentLogs_1["default"], null);
            case "settings":
                return React.createElement(Settings_1["default"], null);
            default:
                return React.createElement(SearchQATesting_1["default"], null);
        }
    };
    return (React.createElement("div", { className: darkMode ? "dark" : "" },
        React.createElement("div", { className: "min-h-screen bg-white dark:bg-slate-900 transition-colors" },
            React.createElement("header", { className: "border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800" },
                React.createElement("div", { className: "px-6 py-3" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center space-x-6" },
                            React.createElement("h1", { className: "text-base font-semibold text-gray-900 dark:text-slate-100 tracking-tight" }, "Multilingual Semantic Search Evaluation")),
                        React.createElement("div", { className: "flex items-center space-x-4" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleExport("csv"); }, className: "h-8 border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" },
                                React.createElement(lucide_react_1.Download, { className: "w-3 h-3 mr-2" }),
                                "Export"),
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setDarkMode(!darkMode); }, className: "h-8 w-8 p-0 dark:hover:bg-slate-700" }, darkMode ? (React.createElement(lucide_react_1.Sun, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Moon, { className: "w-4 h-4" }))))))),
            React.createElement("div", { className: "flex h-[calc(100vh-57px)]" },
                React.createElement("aside", { className: "w-56 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto" },
                    React.createElement("nav", { className: "p-3 space-y-1" }, tabs.map(function (tab, index) {
                        var prevGroup = index > 0 ? tabs[index - 1].group : null;
                        var showDivider = tab.group !== prevGroup && index > 0;
                        return (React.createElement("div", { key: tab.id },
                            showDivider && (React.createElement("div", { className: "my-3 border-t border-gray-200 dark:border-slate-700" })),
                            React.createElement("button", { onClick: function () { return setActiveTab(tab.id); }, className: "w-full flex items-center px-3 py-2 rounded text-left transition-colors text-sm " + (activeTab === tab.id
                                    ? "bg-slate-700 dark:bg-slate-600 text-white font-medium"
                                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700") }, tab.label)));
                    }))),
                React.createElement("main", { className: "flex-1 bg-white dark:bg-slate-900 overflow-y-auto" }, renderTabContent())))));
}
exports["default"] = App;
