"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _datasetEvalController = require("../controllers/datasetEval.controller.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();
/**
 * Dataset Evaluation Metrics
 *
 * FE usage:
 *  - Header filters
 *  - DatasetMetricsChart
 *  - DatasetStatisticsTable
 *  - DatasetInsightCards
 *
 * Query params:
 *  - dataset=all|en|vi
 *  - model=all|gpt|gemini|deepseek
 *  - experiment=all|exp1|exp2|...
 *  - verification=all|bi|cross|both
 *
 * Response:
 * {
 *   items: [
 *     {
 *       language: "EN",
 *       model: "GPT",
 *       verification: "both",
 *       qaCount: 7021,
 *       avgSimilarity: 0.861,
 *       avgEntailment: 0.842,
 *       verifiedRatio: 0.787
 *     }
 *   ]
 * }
 */


router.get("/metrics", _datasetEvalController.getDatasetEvalMetrics);
var _default = router;
exports["default"] = _default;