"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDocMeta = getDocMeta;
exports.getPdfStream = getPdfStream;
exports.refreshIndex = refreshIndex;

var _pdfService = require("../services/pdf.service.js");

/**
 * GET /qa/doc-meta?dataset=articles_en&pdf=<title_or_filename>&chunk_id=chunk_0001
 * Returns: { pdfUrl, downloadUrl, sizeBytes, ... }
 */
function getDocMeta(req, res) {
  var _req$query, _req$query$dataset, dataset, pdf, chunk_id, meta, status;

  return regeneratorRuntime.async(function getDocMeta$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, _req$query$dataset = _req$query.dataset, dataset = _req$query$dataset === void 0 ? "articles_en" : _req$query$dataset, pdf = _req$query.pdf, chunk_id = _req$query.chunk_id;

          if (pdf) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            error: "pdf is required"
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _pdfService.getPdfMeta)({
            dataset: dataset,
            pdf: pdf,
            chunk_id: chunk_id
          }));

        case 6:
          meta = _context.sent;
          return _context.abrupt("return", res.json(meta));

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          status = _context.t0.status || 500;
          return _context.abrupt("return", res.status(status).json({
            error: _context.t0.message || "Server error"
          }));

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}
/**
 * GET /qa/pdf?dataset=articles_en&pdf=<title_or_filename>&download=1
 * - download=1 -> attachment
 * - else -> inline
 */


function getPdfStream(req, res) {
  var _req$query2, dataset, pdf, download;

  return regeneratorRuntime.async(function getPdfStream$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          try {
            _req$query2 = req.query, dataset = _req$query2.dataset, pdf = _req$query2.pdf, download = _req$query2.download;
            (0, _pdfService.streamPdfToResponse)({
              dataset: dataset,
              pdf: pdf,
              download: download === "1" || download === "true"
            }, req, res);
          } catch (e) {
            console.error("PDF stream error:", e);
            res.status(e.status || 500).json({
              error: e.message || "Failed to stream PDF",
              debug: e.debug || null
            });
          }

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}
/**
 * OPTIONAL:
 * POST /qa/refresh-index
 * body: { dataset: "articles_en" }  // or "articles_vi"
 *
 * Use when you add/remove PDFs without restarting server.
 */


function refreshIndex(req, res) {
  var _ref, dataset, status;

  return regeneratorRuntime.async(function refreshIndex$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _ref = req.body || {}, dataset = _ref.dataset;

          if (dataset) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            error: "dataset is required"
          }));

        case 4:
          (0, _pdfService.refreshDatasetIndex)(dataset);
          return _context3.abrupt("return", res.json({
            ok: true,
            dataset: dataset
          }));

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          status = _context3.t0.status || 500;
          return _context3.abrupt("return", res.status(status).json({
            error: _context3.t0.message || "Server error"
          }));

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 8]]);
}