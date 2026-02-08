"use strict";
exports.__esModule = true;
var card_1 = require("@/app/components/ui/card");
var button_1 = require("@/app/components/ui/button");
var input_1 = require("@/app/components/ui/input");
var lucide_react_1 = require("lucide-react");
function ExperimentLogsHeader() {
    return (React.createElement("div", null,
        React.createElement("h2", { className: "text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1" }, "Experiment Logs"),
        React.createElement("p", { className: "text-sm text-gray-600 dark:text-slate-400 mb-6" }, "Track and compare experimental configurations, metrics, and outcomes."),
        React.createElement(card_1.Card, { className: "border-gray-200 dark:border-slate-700 dark:bg-slate-850" },
            React.createElement(card_1.CardContent, { className: "p-4" },
                React.createElement("div", { className: "flex items-center space-x-4" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(input_1.Input, { placeholder: "Search by Run ID, model, or dataset...", className: "border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" })),
                    React.createElement(button_1.Button, { variant: "outline", className: "border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" },
                        React.createElement(lucide_react_1.Search, { className: "w-4 h-4 mr-2" }),
                        "Search"),
                    React.createElement(button_1.Button, { variant: "outline", className: "border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        "Export All"))))));
}
exports["default"] = ExperimentLogsHeader;
