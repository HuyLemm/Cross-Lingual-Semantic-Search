"use strict";
exports.__esModule = true;
var ModelComparisonTable_1 = require("./model-comparison/ModelComparisonTable");
var ModelCharts_1 = require("./model-comparison/ModelCharts");
var ModelRecommendations_1 = require("./model-comparison/ModelRecommendations");
var modelComparisonData_1 = require("./model-comparison/modelComparisonData");
function ModelComparison() {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement(ModelComparisonTable_1["default"], { models: modelComparisonData_1.models }),
        React.createElement(ModelCharts_1["default"], { radarData: modelComparisonData_1.radarData, tradeoffData: modelComparisonData_1.tradeoffData }),
        React.createElement(ModelRecommendations_1["default"], null)));
}
exports["default"] = ModelComparison;
