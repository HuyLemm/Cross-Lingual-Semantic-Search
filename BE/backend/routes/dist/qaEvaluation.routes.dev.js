"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _qaEvaluationController = require("../controllers/qaEvaluation.controller.js");

var _crossModelComparisonController = require("../controllers/crossModelComparison.controller.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// app/(whatever)/backend/routes/qaEvaluation.routes.js
var router = _express["default"].Router(); // ModelSection payload for dashboard charts


router.get("/model-section", _qaEvaluationController.getModelSection);
router.get("/cross-model", _crossModelComparisonController.getCrossModelComparison);
var _default = router;
exports["default"] = _default;