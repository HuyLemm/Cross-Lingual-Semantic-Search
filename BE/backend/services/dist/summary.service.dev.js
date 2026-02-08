"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSummary = buildSummary;
exports.buildQAList = buildQAList;

var _utils = require("../utils/utils.js");

/* =========================================================
 * SUMMARY
 * ========================================================= */
function buildSummary(query) {
  var _query$dataset = query.dataset,
      dataset = _query$dataset === void 0 ? "all" : _query$dataset,
      _query$model = query.model,
      model = _query$model === void 0 ? "all" : _query$model,
      _query$experiment = query.experiment,
      experiment = _query$experiment === void 0 ? "all" : _query$experiment,
      _query$quality = query.quality,
      quality = _query$quality === void 0 ? "0.7" : _query$quality; // 1. Load

  var qas = (0, _utils.loadTotalQAs)({
    dataset: dataset,
    model: model,
    experiment: experiment
  }); // 2. Dedupe

  qas = (0, _utils.dedupeContent)(qas);
  var totalQAPairs = qas.length; // 3. Apply QUALITY

  var verifiedQAs = (0, _utils.applyQualityFilter)(qas, quality);
  var verifiedQAPairs = verifiedQAs.length; // 4. Metrics PART 1 — DATASET LEVEL (không phụ thuộc quality)

  var _computeFullMetrics = (0, _utils.computeFullMetrics)(qas),
      validationRate = _computeFullMetrics.validationRate,
      step1OnlyRate = _computeFullMetrics.step1OnlyRate; // 🔹 dùng qas gốc
  // 5. Metrics PART 2 — QUALITY LEVEL


  var _computeFullMetrics2 = (0, _utils.computeFullMetrics)(verifiedQAs),
      avgBiEncoder = _computeFullMetrics2.avgBiEncoder,
      avgCrossEncoder = _computeFullMetrics2.avgCrossEncoder; // 🔹 dùng verified


  var totalDocuments = (0, _utils.countDocuments)({
    dataset: dataset
  });
  return {
    totalDocuments: totalDocuments,
    totalQAPairs: totalQAPairs,
    verifiedQAPairs: verifiedQAPairs,
    avgBiEncoder: avgBiEncoder,
    avgCrossEncoder: avgCrossEncoder,
    validationRate: validationRate,
    step1OnlyRate: step1OnlyRate
  };
}
/* =========================================================
 * QA LIST
 * ========================================================= */


function buildQAList(query) {
  var _query$page = query.page,
      page = _query$page === void 0 ? 1 : _query$page,
      _query$pageSize = query.pageSize,
      pageSize = _query$pageSize === void 0 ? 20 : _query$pageSize,
      _query$dataset2 = query.dataset,
      dataset = _query$dataset2 === void 0 ? "all" : _query$dataset2,
      _query$model2 = query.model,
      model = _query$model2 === void 0 ? "all" : _query$model2,
      _query$experiment2 = query.experiment,
      experiment = _query$experiment2 === void 0 ? "all" : _query$experiment2,
      _query$quality2 = query.quality,
      quality = _query$quality2 === void 0 ? "all" : _query$quality2,
      _query$search = query.search,
      search = _query$search === void 0 ? "" : _query$search; // 1. Load QA

  var qas = (0, _utils.loadTotalQAs)({
    dataset: dataset,
    model: model,
    experiment: experiment
  }); // 🔹 DEDUPE CONTENT

  qas = (0, _utils.dedupeContent)(qas); // 2. QUALITY

  qas = (0, _utils.applyQualityFilter)(qas, quality); // 3. SEARCH

  qas = (0, _utils.applyFilters)(qas, {
    search: search
  }); // 4. Pagination

  var p = Number(page);
  var ps = Number(pageSize);
  var start = (p - 1) * ps;
  return {
    total: qas.length,
    page: p,
    pageSize: ps,
    items: qas.slice(start, start + ps)
  };
}