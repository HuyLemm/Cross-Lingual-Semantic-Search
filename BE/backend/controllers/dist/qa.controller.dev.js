"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSummary = getSummary;
exports.getQAList = getQAList;

var _qaService = require("../services/qa.service.js");

function getSummary(req, res) {
  try {
    var data = (0, _qaService.buildSummary)(req.query);
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
    var data = (0, _qaService.buildQAList)(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
}