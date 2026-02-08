"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSummary = buildSummary;
exports.buildQAList = buildQAList;

var _utils = require("../utils/utils.js");

function buildSummary(query) {
  var _query$dataset = query.dataset,
      dataset = _query$dataset === void 0 ? 'all' : _query$dataset,
      _query$model = query.model,
      model = _query$model === void 0 ? 'all' : _query$model,
      _query$experiment = query.experiment,
      experiment = _query$experiment === void 0 ? 'all' : _query$experiment,
      _query$quality = query.quality,
      quality = _query$quality === void 0 ? 'all' : _query$quality; // Load base QA

  var totalQAs = (0, _utils.loadTotalQAs)({
    dataset: dataset
  }); // Filter dataset/model/experiment

  var filteredTotalQAs = totalQAs.filter(function (qa) {
    if (model !== 'all' && qa.model !== model) return false;
    if (dataset === 'vjol' && qa.language !== 'vi') return false;
    if (dataset === 'semantic_scholar' && qa.language !== 'en') return false;
    if (experiment !== 'all' && !qa.qa_id.includes(experiment)) return false;
    return true;
  });
  var totalQAPairs = filteredTotalQAs.length; // Verified = pass step1 + step2

  var verifiedQAs = filteredTotalQAs.filter(function (q) {
    return q.verified === true && q.verified_step2 === true;
  });

  if (quality !== 'all') {
    var verifiedFromFile = (0, _utils.loadVerifiedQAs)({
      dataset: dataset,
      quality: quality
    });
    var idSet = new Set(verifiedFromFile.map(function (q) {
      return q.qa_id;
    }));
    verifiedQAs = filteredTotalQAs.filter(function (q) {
      return idSet.has(q.qa_id);
    });
  }

  var verifiedQAPairs = verifiedQAs.length;

  var _computeSimilarityAnd = (0, _utils.computeSimilarityAndRate)(filteredTotalQAs, verifiedQAs),
      avgSimilarity = _computeSimilarityAnd.avgSimilarity,
      validationRate = _computeSimilarityAnd.validationRate;

  var totalDocuments = (0, _utils.countDocuments)({
    dataset: dataset
  });
  return {
    totalDocuments: totalDocuments,
    totalQAPairs: totalQAPairs,
    verifiedQAPairs: verifiedQAPairs,
    avgSimilarity: avgSimilarity,
    validationRate: validationRate
  };
}

function buildQAList(query) {
  var _query$page = query.page,
      page = _query$page === void 0 ? 1 : _query$page,
      _query$pageSize = query.pageSize,
      pageSize = _query$pageSize === void 0 ? 20 : _query$pageSize,
      _query$dataset2 = query.dataset,
      dataset = _query$dataset2 === void 0 ? 'all' : _query$dataset2,
      _query$model2 = query.model,
      model = _query$model2 === void 0 ? 'all' : _query$model2,
      _query$experiment2 = query.experiment,
      experiment = _query$experiment2 === void 0 ? 'all' : _query$experiment2,
      _query$quality2 = query.quality,
      quality = _query$quality2 === void 0 ? 'all' : _query$quality2,
      _query$search = query.search,
      search = _query$search === void 0 ? '' : _query$search;
  var qas = (0, _utils.loadTotalQAs)({
    dataset: dataset
  });
  qas = qas.filter(function (qa) {
    if (model !== 'all' && qa.model !== model) return false;
    if (dataset === 'vjol' && qa.language !== 'vi') return false;
    if (dataset === 'semantic_scholar' && qa.language !== 'en') return false;
    if (experiment !== 'all' && !qa.qa_id.includes(experiment)) return false;
    return true;
  });

  if (quality !== 'all') {
    var verifiedFromFile = (0, _utils.loadVerifiedQAs)({
      dataset: dataset,
      quality: quality
    });
    var idSet = new Set(verifiedFromFile.map(function (q) {
      return q.qa_id;
    }));
    qas = qas.filter(function (q) {
      return idSet.has(q.qa_id);
    });
  }

  qas = (0, _utils.applyFilters)(qas, {
    search: search
  });
  var p = Number(page);
  var ps = Number(pageSize);
  var start = (p - 1) * ps;
  var end = start + ps;
  return {
    total: qas.length,
    page: p,
    pageSize: ps,
    items: qas.slice(start, end)
  };
}