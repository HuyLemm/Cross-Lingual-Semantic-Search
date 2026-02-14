"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDatasetEvalMetrics = getDatasetEvalMetrics;

var _datasetEvalService = require("../services/datasetEval.service.js");

function getDatasetEvalMetrics(req, res) {
  try {
    // Normalize query (tránh undefined / array / casing)
    var query = {
      dataset: String(req.query.dataset || "all"),
      model: String(req.query.model || "all"),
      experiment: String(req.query.experiment || "all"),
      language: String(req.query.language || "all"),
      verification: String(req.query.verification || "both")
    };
    var result = (0, _datasetEvalService.buildDatasetEvalMetrics)(query);
    return res.json(result);
  } catch (err) {
    console.error("[dataset-eval] error:", err);
    return res.status(500).json({
      error: "Failed to build dataset evaluation metrics"
    });
  }
}