"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _summaryController = require("../controllers/summary.controller.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.get('/get-summary', _summaryController.getSummary);
router.get("/qa-list", _summaryController.getQAList);
router.get('/experiments', _summaryController.getExperiments);
router.get('/dataset-overview', _summaryController.getDatasetOverview);
var _default = router;
exports["default"] = _default;