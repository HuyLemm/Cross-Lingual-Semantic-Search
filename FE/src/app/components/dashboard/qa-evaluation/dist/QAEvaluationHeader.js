// app/(whatever)/qa-eval/components/QAEvaluationHeader.tsx
"use client";
"use strict";
exports.__esModule = true;
var TABS = [
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gemini-2.5", label: "Gemini 2.5 Flash" },
    { id: "deepseek-r1t2", label: "DeepSeek R1T2" },
];
function QAEvaluationHeader(_a) {
    var selectedModel = _a.selectedModel, setSelectedModel = _a.setSelectedModel, quality = _a.quality, setQuality = _a.setQuality;
    return (React.createElement("div", { className: "mb-8" },
        React.createElement("h2", { className: "text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4" }, "Question Answering Evaluation Dashboard"),
        React.createElement("div", { className: "flex items-center gap-6 flex-wrap" },
            React.createElement("div", { className: "inline-flex rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-1" }, TABS.map(function (t) {
                var active = t.id === selectedModel;
                return (React.createElement("button", { key: t.id, type: "button", onClick: function () { return setSelectedModel(t.id); }, className: [
                        "px-4 py-2 text-sm rounded-lg transition",
                        active
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800",
                    ].join(" ") }, t.label));
            })),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("span", { className: "text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400" }, "Quality:"),
                React.createElement("select", { value: quality, onChange: function (e) { return setQuality(e.target.value); }, className: "text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200" },
                    React.createElement("option", { value: "0.7" }, "0.7"),
                    React.createElement("option", { value: "0.8" }, "0.8"))))));
}
exports["default"] = QAEvaluationHeader;
