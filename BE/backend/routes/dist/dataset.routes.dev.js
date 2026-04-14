"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _datasetController = require("../controllers/dataset.controller.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// backend/routes/pdf.routes.js
var router = _express["default"].Router(); // GET /api/pdfs?language=english
// GET /api/pdfs?language=vietnamese


router.get("/list", _datasetController.listPdfs); // GET /api/pdfs/stats

router.get("/stats", _datasetController.getDatasetStats); // view / download

router.get("/view", _datasetController.viewPdf); // /api/pdfs/view?language=english&path=sub/a.pdf

router.get("/download", _datasetController.downloadPdf); // /api/pdfs/download?language=english&path=sub/a.pdf

var _default = router;
exports["default"] = _default;