"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _pdfController = require("../controllers/pdf.controller.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.get("/doc-meta", _pdfController.getDocMeta);
router.get("/pdf", _pdfController.getPdfStream); // optional

router.post("/refresh-index", _pdfController.refreshIndex);
var _default = router;
exports["default"] = _default;