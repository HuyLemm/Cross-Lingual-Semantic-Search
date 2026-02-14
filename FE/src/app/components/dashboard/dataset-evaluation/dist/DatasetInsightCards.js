"use strict";
exports.__esModule = true;
var card_1 = require("../../ui/card");
var badge_1 = require("../../ui/badge");
var lucide_react_1 = require("lucide-react");
function DatasetInsightCards(_a) {
    var insights = _a.insights;
    if (!insights)
        return null;
    return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
        React.createElement(card_1.Card, { className: "border-l-4 border-l-green-500" },
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1" }, "Highest Verification Reliability"),
                React.createElement("div", { className: "flex items-baseline gap-2 mt-2" },
                    React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono text-lg" }, insights.bestLanguage.language),
                    React.createElement("span", { className: "text-sm text-gray-500" },
                        "(",
                        insights.bestLanguage.model,
                        ")")),
                React.createElement("p", { className: "text-sm text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1" },
                    React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                    (insights.bestLanguage.verifiedRatio * 100).toFixed(1),
                    "% Verified"))),
        React.createElement(card_1.Card, { className: "border-l-4 border-l-blue-500" },
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1" }, "Strongest Semantic Similarity"),
                React.createElement("div", { className: "flex items-baseline gap-2 mt-2" },
                    React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono text-lg" }, insights.highestSimilarity.language),
                    React.createElement("span", { className: "text-sm text-gray-500" },
                        "(",
                        insights.highestSimilarity.model,
                        ")")),
                React.createElement("p", { className: "text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium flex items-center gap-1" },
                    React.createElement(lucide_react_1.Minus, { className: "w-4 h-4" }),
                    insights.highestSimilarity.avgSimilarity.toFixed(3)))),
        React.createElement(card_1.Card, { className: "border-l-4 border-l-purple-500" },
            React.createElement(card_1.CardContent, { className: "p-5" },
                React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1" }, "Strongest Entailment Correctness"),
                React.createElement("div", { className: "flex items-baseline gap-2 mt-2" },
                    React.createElement(badge_1.Badge, { variant: "outline", className: "font-mono text-lg" }, insights.strongestEntailment.language),
                    React.createElement("span", { className: "text-sm text-gray-500" },
                        "(",
                        insights.strongestEntailment.model,
                        ")")),
                React.createElement("p", { className: "text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium flex items-center gap-1" },
                    React.createElement(lucide_react_1.Minus, { className: "w-4 h-4" }),
                    insights.strongestEntailment.avgEntailment.toFixed(3))))));
}
exports["default"] = DatasetInsightCards;
