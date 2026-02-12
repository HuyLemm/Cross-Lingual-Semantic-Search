"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSummary = getSummary;
exports.getQAList = getQAList;
exports.getExperiments = getExperiments;
exports.getDatasetOverview = getDatasetOverview;

var _summaryService = require("../services/summary.service.js");

var _utils = require("../utils/utils.js");

function getSummary(req, res) {
  try {
    var data = (0, _summaryService.buildSummary)(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
}

function getQAList(req, res) {
  try {
    var data = (0, _summaryService.buildQAList)(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
}

function getExperiments(req, res) {
  try {
    var _req$query = req.query,
        _req$query$model = _req$query.model,
        model = _req$query$model === void 0 ? "all" : _req$query$model,
        _req$query$dataset = _req$query.dataset,
        dataset = _req$query$dataset === void 0 ? "all" : _req$query$dataset;
    var list = (0, _utils.getExperimentsByModel)(model, dataset);
    res.json(list);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}

function getDatasetOverview(req, res) {
  try {
    var rows = (0, _summaryService.buildDatasetOverview)();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
}