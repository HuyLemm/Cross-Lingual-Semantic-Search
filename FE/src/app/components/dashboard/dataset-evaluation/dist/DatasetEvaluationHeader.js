"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var select_1 = require("../../ui/select");
function DatasetEvaluationHeader(_a) {
    var language = _a.language, selectedModel = _a.selectedModel, verification = _a.verification, onLanguageChange = _a.onLanguageChange, onModelChange = _a.onModelChange, onVerificationChange = _a.onVerificationChange;
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", null,
            React.createElement("h2", { className: "text-2xl font-semibold text-gray-900 dark:text-white mb-2" }, "QA Dataset Quality Evaluation"),
            React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400" }, "Analyze quality, verification reliability, and distribution of generated QA dataset")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement("div", { className: "flex flex-wrap items-center gap-4" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("label", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Language:"),
                        React.createElement(select_1.Select, { value: language, onValueChange: onLanguageChange },
                            React.createElement(select_1.SelectTrigger, { className: "w-[140px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All"),
                                React.createElement(select_1.SelectItem, { value: "EN" }, "English"),
                                React.createElement(select_1.SelectItem, { value: "VI" }, "Vietnamese")))),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("label", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Model:"),
                        React.createElement(select_1.Select, { value: selectedModel, onValueChange: onModelChange },
                            React.createElement(select_1.SelectTrigger, { className: "w-[200px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Models"),
                                React.createElement(select_1.SelectItem, { value: "gpt" }, "GPT-5.2"),
                                React.createElement(select_1.SelectItem, { value: "gemini" }, "Gemini 2.5 Flash"),
                                React.createElement(select_1.SelectItem, { value: "deepseek" }, "DeepSeek R1T2")))),
                    React.createElement("div", { className: "flex items-center gap-2 ml-auto" },
                        React.createElement("label", { className: "text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide" }, "Verified By:"),
                        React.createElement(select_1.Select, { value: verification, onValueChange: onVerificationChange },
                            React.createElement(select_1.SelectTrigger, { className: "w-[180px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All"),
                                React.createElement(select_1.SelectItem, { value: "bi" }, "Bi-Encoder"),
                                React.createElement(select_1.SelectItem, { value: "cross" }, "Cross-Encoder"),
                                React.createElement(select_1.SelectItem, { value: "both" }, "Bi + Cross (Final)")))))))));
}
exports["default"] = DatasetEvaluationHeader;
