"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listPdfFiles = listPdfFiles;
exports.getPdfStats = getPdfStats;
exports.resolvePdfAbsolutePath = resolvePdfAbsolutePath;
exports.getPdfStreamPayload = getPdfStreamPayload;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireWildcard(require("fs"));

var _promises = _interopRequireDefault(require("fs/promises"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function resolveDatasetDir(language) {
  var baseDir = _path["default"].join(process.cwd(), "data");

  var lang = String(language || "").toLowerCase();
  if (lang === "english" || lang === "en") return _path["default"].join(baseDir, "articles_en");
  if (lang === "vietnamese" || lang === "vi") return _path["default"].join(baseDir, "articles_vi");
  return _path["default"].join(baseDir, "articles_en");
}

function walkDirRecursive(dir) {
  var results, entries, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, entry, full;

  return regeneratorRuntime.async(function walkDirRecursive$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          results = [];
          _context.next = 3;
          return regeneratorRuntime.awrap(_promises["default"].readdir(dir, {
            withFileTypes: true
          }));

        case 3:
          entries = _context.sent;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 7;
          _iterator = entries[Symbol.iterator]();

        case 9:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 24;
            break;
          }

          entry = _step.value;
          full = _path["default"].join(dir, entry.name);

          if (!entry.isDirectory()) {
            _context.next = 20;
            break;
          }

          _context.t0 = results;
          _context.next = 16;
          return regeneratorRuntime.awrap(walkDirRecursive(full));

        case 16:
          _context.t1 = _context.sent;
          results = _context.t0.concat.call(_context.t0, _context.t1);
          _context.next = 21;
          break;

        case 20:
          results.push(full);

        case 21:
          _iteratorNormalCompletion = true;
          _context.next = 9;
          break;

        case 24:
          _context.next = 30;
          break;

        case 26:
          _context.prev = 26;
          _context.t2 = _context["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context.t2;

        case 30:
          _context.prev = 30;
          _context.prev = 31;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 33:
          _context.prev = 33;

          if (!_didIteratorError) {
            _context.next = 36;
            break;
          }

          throw _iteratorError;

        case 36:
          return _context.finish(33);

        case 37:
          return _context.finish(30);

        case 38:
          return _context.abrupt("return", results);

        case 39:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 26, 30, 38], [31,, 33, 37]]);
}

function toPosixRelative(rootDir, fullPath) {
  var rel = _path["default"].relative(rootDir, fullPath);

  return rel.split(_path["default"].sep).join("/");
}

function listPdfFiles(language) {
  var datasetDir, allPaths, pdfPaths, files;
  return regeneratorRuntime.async(function listPdfFiles$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          datasetDir = resolveDatasetDir(language);

          if (_fs["default"].existsSync(datasetDir)) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", {
            language: language || "english",
            datasetDir: datasetDir,
            count: 0,
            files: []
          });

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(walkDirRecursive(datasetDir));

        case 5:
          allPaths = _context3.sent;
          pdfPaths = allPaths.filter(function (p) {
            return p.toLowerCase().endsWith(".pdf");
          }).sort(function (a, b) {
            return a.localeCompare(b);
          });
          _context3.next = 9;
          return regeneratorRuntime.awrap(Promise.all(pdfPaths.map(function _callee(fullPath) {
            var st;
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(_promises["default"].stat(fullPath));

                  case 2:
                    st = _context2.sent;
                    return _context2.abrupt("return", {
                      name: _path["default"].basename(fullPath),
                      relativePath: toPosixRelative(datasetDir, fullPath),
                      sizeBytes: st.size,
                      updatedAt: st.mtime.toISOString()
                    });

                  case 4:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          })));

        case 9:
          files = _context3.sent;
          return _context3.abrupt("return", {
            language: language || "english",
            datasetDir: datasetDir,
            count: files.length,
            files: files
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function getPdfStats() {
  var _ref, _ref2, en, vi, sumBytes;

  return regeneratorRuntime.async(function getPdfStats$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Promise.all([listPdfFiles("english"), listPdfFiles("vietnamese")]));

        case 2:
          _ref = _context4.sent;
          _ref2 = _slicedToArray(_ref, 2);
          en = _ref2[0];
          vi = _ref2[1];

          sumBytes = function sumBytes(arr) {
            return arr.reduce(function (acc, f) {
              return acc + (f.sizeBytes || 0);
            }, 0);
          };

          return _context4.abrupt("return", {
            totalDocs: en.count + vi.count,
            englishDocs: en.count,
            vietnameseDocs: vi.count,
            totalBytes: sumBytes(en.files) + sumBytes(vi.files)
          });

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
}
/**
 * Normalize + validate relative path from client.
 * - Prevent "../" path traversal
 * - Must end with .pdf
 * - Returns safe relative path (posix style)
 */


function sanitizeRelativePdfPath(relativePath) {
  var p = String(relativePath || "").trim();
  if (!p) throw new Error("Missing path");
  if (p.includes("\0")) throw new Error("Invalid path"); // Decode URI if user passed encoded path

  var decoded = p;

  try {
    decoded = decodeURIComponent(p);
  } catch (_unused) {} // keep original if decode fails
  // Use posix-style normalization for URL-ish paths


  var normalized = decoded.replaceAll("\\", "/"); // Must be pdf

  if (!normalized.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only .pdf files are allowed");
  } // Disallow absolute paths


  if (normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized)) {
    throw new Error("Absolute paths are not allowed");
  } // Resolve and ensure it doesn't escape root by checking for ".." segments after normalize


  var safe = _path["default"].posix.normalize(normalized);

  if (safe.startsWith("..") || safe.includes("/../")) {
    throw new Error("Path traversal detected");
  }

  return safe;
}
/**
 * Return absolute file path under dataset folder safely.
 * Throws if file doesn't exist.
 */


function resolvePdfAbsolutePath(language, relativePath) {
  var datasetDir, safeRel, absPath, relToRoot;
  return regeneratorRuntime.async(function resolvePdfAbsolutePath$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          datasetDir = resolveDatasetDir(language); // sanitize + join

          safeRel = sanitizeRelativePdfPath(relativePath); // IMPORTANT: use path.join with OS paths but relative uses forward slashes -> split

          absPath = _path["default"].join.apply(_path["default"], [datasetDir].concat(_toConsumableArray(safeRel.split("/")))); // Ensure absPath is still inside datasetDir

          relToRoot = _path["default"].relative(datasetDir, absPath);

          if (!(relToRoot.startsWith("..") || _path["default"].isAbsolute(relToRoot))) {
            _context5.next = 6;
            break;
          }

          throw new Error("Path escapes dataset root");

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(_promises["default"].access(absPath));

        case 8:
          return _context5.abrupt("return", {
            datasetDir: datasetDir,
            absPath: absPath,
            safeRel: safeRel
          });

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  });
}
/**
 * Build a stream response payload for controller to pipe to res.
 * mode:
 * - "inline": view in browser
 * - "attachment": force download
 */


function getPdfStreamPayload(language, relativePath) {
  var mode,
      _ref3,
      absPath,
      safeRel,
      stat,
      fileName,
      _args6 = arguments;

  return regeneratorRuntime.async(function getPdfStreamPayload$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          mode = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : "inline";
          _context6.next = 3;
          return regeneratorRuntime.awrap(resolvePdfAbsolutePath(language, relativePath));

        case 3:
          _ref3 = _context6.sent;
          absPath = _ref3.absPath;
          safeRel = _ref3.safeRel;
          _context6.next = 8;
          return regeneratorRuntime.awrap(_promises["default"].stat(absPath));

        case 8:
          stat = _context6.sent;
          fileName = _path["default"].basename(safeRel);
          return _context6.abrupt("return", {
            fileName: fileName,
            sizeBytes: stat.size,
            stream: (0, _fs.createReadStream)(absPath),
            headers: {
              "Content-Type": "application/pdf",
              "Content-Length": String(stat.size),
              "Content-Disposition": mode === "attachment" ? "attachment; filename=\"".concat(encodeURIComponent(fileName), "\"") : "inline; filename=\"".concat(encodeURIComponent(fileName), "\""),
              "Cache-Control": "no-store"
            }
          });

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  });
}