"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvePdfPath = resolvePdfPath;
exports.getPdfMeta = getPdfMeta;
exports.streamPdfToResponse = streamPdfToResponse;
exports.refreshDatasetIndex = refreshDatasetIndex;
exports._debugNormalizeTitle = _debugNormalizeTitle;
exports._debugDataDir = _debugDataDir;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Find correct data root at runtime.
 * Supports running node from:
 * - repo root:   process.cwd() = <repo>
 * - backend dir: process.cwd() = <repo>/backend
 */
function resolveDataDir() {
  var cwd = process.cwd();
  var candidates = [_path["default"].join(cwd, "data"), // if running inside backend/
  _path["default"].join(cwd, "backend", "data") // if running from repo root
  ];

  for (var _i = 0, _candidates = candidates; _i < _candidates.length; _i++) {
    var p = _candidates[_i];

    try {
      if (_fs["default"].existsSync(p) && _fs["default"].statSync(p).isDirectory()) return p;
    } catch (_unused) {}
  }

  var err = new Error("DATA_DIR not found. Tried:\n- ".concat(candidates.join("\n- "), "\nCurrent cwd: ").concat(cwd));
  err.status = 500;
  throw err;
}
/**
 * Base folder chứa data pdf:
 * <DATA_DIR>/<dataset>/<pdf>
 *
 * Ví dụ:
 * data/articles_en/xxx.pdf
 * data/articles_vi/yyy.pdf
 */


var DATA_DIR = resolveDataDir();
/**
 * Cache mapping theo dataset:
 * dataset -> { folderPath, index(Map), builtAt }
 */

var DATASET_INDEX_CACHE = new Map();
/** chỉ cho phép dataset dạng chữ/số/_/- để tránh path traversal */

function sanitizeDataset(dataset) {
  var d = String(dataset || "").trim();
  if (!d) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(d)) return null;
  return d;
}
/** decode an toàn */


function safeDecodeURIComponent(v) {
  try {
    return decodeURIComponent(v);
  } catch (_unused2) {
    return String(v || "");
  }
}
/**
 * ✅ Unicode-safe normalize (fix VI issue):
 * - ALWAYS NFC normalize (giải quyết NFD vs NFC, hay gặp trên macOS)
 * - lowercase
 * - remove :
 * - replace -/_ => space
 * - remove punctuation but KEEP unicode letters/numbers/spaces: [^\p{L}\p{N}\s]
 * - unify whitespace
 */


function normalizeTitle(title) {
  if (!title) return "";
  var t = String(title).normalize("NFC");
  t = t.toLowerCase();
  t = t.replace(/:/g, "");
  t = t.replace(/-/g, " ");
  t = t.replace(/_/g, " ");
  t = t.replace(/(?:[\0-\x08\x0E-\x1F!-\/:-@\[-`\{-\x9F\xA1-\xA9\xAB-\xB1\xB4\xB6-\xB8\xBB\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u065F\u066A-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07BF\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u089F\u08B5\u08BE-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0965\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09E5\u09F2\u09F3\u09FA\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A65\u0A70\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AE5\u0AF0-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B65\u0B70\u0B78-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0BE5\u0BF3-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B-\u0C5F\u0C62-\u0C65\u0C70-\u0C77\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDD\u0CDF\u0CE2-\u0CE5\u0CF0\u0CF3-\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57\u0D62-\u0D65\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DE5\u0DF0-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E4F\u0E5A-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F1F\u0F34-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u104A-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u1368\u137D-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1712-\u171F\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u17DF\u17EA-\u17EF\u17FA-\u180F\u181A-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u1945\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19FF\u1A17-\u1A1F\u1A55-\u1A7F\u1A8A-\u1A8F\u1A9A-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4C-\u1B4F\u1B5A-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BFF\u1C24-\u1C3F\u1C4A-\u1C4C\u1C7E\u1C7F\u1C89-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u206F\u2072\u2073\u207A-\u207E\u208A-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A-\u245F\u249C-\u24E9\u2500-\u2775\u2794-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFC\u2CFE\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u2FFF\u3001-\u3004\u3008-\u3020\u302A-\u3030\u3036\u3037\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u3191\u3196-\u319F\u31BB-\u31EF\u3200-\u321F\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DB6-\u4DFF\u9FF0-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6F0-\uA716\uA720\uA721\uA789\uA78A\uA7C0\uA7C1\uA7C7-\uA7F6\uA802\uA806\uA80B\uA823-\uA82F\uA836-\uA83F\uA874-\uA881\uA8B4-\uA8CF\uA8DA-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9DA-\uA9DF\uA9E5\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA4F\uAA5A-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB68-\uAB6F\uABE3-\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD\uFEFE\uFF00-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDD06\uDD34-\uDD3F\uDD79-\uDD89\uDD8C-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEE0\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC57\uDC77\uDC78\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE3F\uDE49-\uDE5F\uDE7F\uDEA0-\uDEBF\uDEC8\uDEE5-\uDEEA\uDEF0-\uDEFF\uDF36-\uDF3F\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD24-\uDD2F\uDD3A-\uDE5F\uDE7F-\uDEFF\uDF28-\uDF2F\uDF46-\uDF50\uDF55-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC51\uDC70-\uDC82\uDCB0-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDD02\uDD27-\uDD35\uDD40-\uDD43\uDD45-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDCF\uDDDB\uDDDD-\uDDE0\uDDF5-\uDDFF\uDE12\uDE2C-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDEEF\uDEFA-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC4F\uDC5A-\uDC5E\uDC60-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE4F\uDE5A-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B-\uDF2F\uDF3C-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCF3-\uDCFE\uDD00-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC4F\uDC6D-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF3-\uDFBF\uDFD5-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD836\uD837\uD839\uD83D-\uD83F\uD87B-\uD87D\uD87F-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE97-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD834[\uDC00-\uDEDF\uDEF4-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|[\uD838\uD83C][\uDC00-\uDCFF\uDD2D-\uDD36\uDD3E\uDD3F\uDD4A-\uDD4D\uDD4F-\uDEBF\uDEEC-\uDEEF\uDEFA-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD0-\uDCFF\uDD44-\uDD4A\uDD4C-\uDD4F\uDD5A-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCAC\uDCB0\uDCB5-\uDD00\uDD2E\uDD3E-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, ""); // ✅ keep Vietnamese letters

  t = t.replace(/\s+/g, " ");
  return t.trim();
}
/** check exists + ensure it is pdf */


function isPdfFilename(name) {
  return typeof name === "string" && name.toLowerCase().endsWith(".pdf");
}
/**
 * Build index for a dataset folder:
 * normalized(title_without_ext) -> filename.pdf (real)
 */


function buildDatasetIndex(dataset) {
  var folderPath = _path["default"].join(DATA_DIR, dataset);

  if (!_fs["default"].existsSync(folderPath) || !_fs["default"].statSync(folderPath).isDirectory()) {
    var err = new Error("Dataset folder not found: ".concat(dataset));
    err.status = 404;
    err.debug = {
      DATA_DIR: DATA_DIR,
      folderPath: folderPath
    };
    throw err;
  }

  var files = _fs["default"].readdirSync(folderPath).filter(function (f) {
    return isPdfFilename(f);
  });

  var index = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var file = _step.value;
      var nameWithoutExt = file.replace(/\.pdf$/i, "");
      var key = normalizeTitle(nameWithoutExt);
      if (key) index.set(key, file);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var payload = {
    folderPath: folderPath,
    index: index,
    builtAt: Date.now()
  };
  DATASET_INDEX_CACHE.set(dataset, payload);
  return payload;
}
/** Get cached dataset index; build if missing. */


function getDatasetIndex(dataset) {
  var cached = DATASET_INDEX_CACHE.get(dataset);
  if (cached) return cached;
  return buildDatasetIndex(dataset);
}
/**
 * ✅ Resolve file path:
 * ALWAYS do normalized lookup first (fix VI .pdf name normalization mismatch)
 *
 * Frontend can send:
 * - pdf = "Some File.pdf"
 * - pdf = "Some File" (no ext)
 * - pdf = "Có dấu tiếng Việt.pdf"
 */


function resolvePdfPath(_ref) {
  var dataset = _ref.dataset,
      pdf = _ref.pdf;
  var safeDataset = sanitizeDataset(dataset);

  if (!safeDataset) {
    var err = new Error("Invalid dataset");
    err.status = 400;
    throw err;
  }

  var raw = safeDecodeURIComponent(pdf || "").trim();

  if (!raw) {
    var _err = new Error("Invalid pdf");

    _err.status = 400;
    throw _err;
  }

  var _getDatasetIndex = getDatasetIndex(safeDataset),
      folderPath = _getDatasetIndex.folderPath,
      index = _getDatasetIndex.index; // IMPORTANT: strip path + ext, then normalize


  var base = _path["default"].basename(raw);

  var titleWithoutExt = base.replace(/\.pdf$/i, "");
  var key = normalizeTitle(titleWithoutExt);
  var filename = index.get(key);

  if (!filename) {
    var _err2 = new Error("PDF not found (normalized match failed)");

    _err2.status = 404;
    _err2.debug = {
      dataset: safeDataset,
      raw: raw,
      base: base,
      key: key,
      folderPath: folderPath
    };
    throw _err2;
  }

  var filePath = _path["default"].join(folderPath, filename); // safety check: ensure inside DATA_DIR


  var resolved = _path["default"].resolve(filePath);

  var resolvedBase = _path["default"].resolve(DATA_DIR);

  if (!resolved.startsWith(resolvedBase)) {
    var _err3 = new Error("Invalid path");

    _err3.status = 400;
    _err3.debug = {
      resolved: resolved,
      resolvedBase: resolvedBase
    };
    throw _err3;
  }

  if (!_fs["default"].existsSync(resolved)) {
    var _err4 = new Error("PDF not found on disk");

    _err4.status = 404;
    _err4.debug = {
      resolved: resolved,
      filename: filename,
      folderPath: folderPath
    };
    throw _err4;
  }

  return resolved;
}
/**
 * Return simple metadata for PDF
 */


function getPdfMeta(_ref2) {
  var dataset = _ref2.dataset,
      pdf = _ref2.pdf,
      chunk_id = _ref2.chunk_id;
  var filePath = resolvePdfPath({
    dataset: dataset,
    pdf: pdf
  });

  var stat = _fs["default"].statSync(filePath);

  var filename = _path["default"].basename(filePath);

  return {
    dataset: dataset,
    pdfName: filename,
    sizeBytes: stat.size,
    pages: null,
    // optional: parse page count
    pageNumber: null,
    // optional: map chunk -> page
    chunk_id: chunk_id ? String(chunk_id) : null,
    pdfUrl: "/qa/pdf?dataset=".concat(encodeURIComponent(dataset), "&pdf=").concat(encodeURIComponent(filename)),
    downloadUrl: "/qa/pdf?dataset=".concat(encodeURIComponent(dataset), "&pdf=").concat(encodeURIComponent(filename), "&download=1")
  };
}
/**
 * Stream PDF to client.
 * download=1 -> attachment
 * else -> inline
 *
 * Note: If you need better Chrome PDF support, add Accept-Ranges headers.
 */


function streamPdfToResponse(_ref3, res) {
  var dataset = _ref3.dataset,
      pdf = _ref3.pdf,
      download = _ref3.download;
  var filePath = resolvePdfPath({
    dataset: dataset,
    pdf: pdf
  });

  var filename = _path["default"].basename(filePath);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Disposition", "".concat(download ? "attachment" : "inline", "; filename*=UTF-8''").concat(encodeURIComponent(filename)));

  var stream = _fs["default"].createReadStream(filePath);

  stream.on("error", function (e) {
    console.error("PDF stream error:", e);
    res.status(500).end("Failed to stream pdf");
  });
  stream.pipe(res);
}
/**
 * Optional: refresh index (when you add/remove PDFs while server is running)
 */


function refreshDatasetIndex(dataset) {
  var safeDataset = sanitizeDataset(dataset);

  if (!safeDataset) {
    var err = new Error("Invalid dataset");
    err.status = 400;
    throw err;
  }

  buildDatasetIndex(safeDataset);
  return true;
} // Optional export for debugging


function _debugNormalizeTitle(s) {
  return normalizeTitle(s);
}

function _debugDataDir() {
  return DATA_DIR;
}