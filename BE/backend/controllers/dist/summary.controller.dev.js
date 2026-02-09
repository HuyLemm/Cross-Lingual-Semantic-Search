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
    var _req$query$model = req.query.model,
        model = _req$query$model === void 0 ? 'all' : _req$query$model;
    var exps = (0, _utils.getExperimentsByModel)(model);
    res.json(exps);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}

function getDatasetOverview(req, res) {
  try {
    var data = (0, _summaryService.buildDatasetOverview)();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
}