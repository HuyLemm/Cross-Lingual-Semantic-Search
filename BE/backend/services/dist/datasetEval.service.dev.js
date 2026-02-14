"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildDatasetEvalMetrics = buildDatasetEvalMetrics;

var _utils = require("../utils/utils.js");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var METRICS_CACHE = new Map();

function cacheKey(q) {
  return "".concat(q.dataset, "|").concat(q.model, "|").concat(q.experiment, "|").concat(q.language, "|").concat(q.verification);
}
/* map model name cho FE */


function mapModelName(m) {
  if (m === "gpt") return "GPT-5.2";
  if (m === "gemini") return "Gemini 2.5 Flash";
  if (m === "deepseek") return "DeepSeek R1T2";
  return m;
}

function buildDatasetEvalMetrics(query) {
  var _query$dataset = query.dataset,
      dataset = _query$dataset === void 0 ? "all" : _query$dataset,
      _query$model = query.model,
      model = _query$model === void 0 ? "all" : _query$model,
      _query$experiment = query.experiment,
      experiment = _query$experiment === void 0 ? "all" : _query$experiment,
      _query$language = query.language,
      language = _query$language === void 0 ? "all" : _query$language,
      _query$verification = query.verification,
      verification = _query$verification === void 0 ? "both" : _query$verification;
  var key = cacheKey({
    dataset: dataset,
    model: model,
    experiment: experiment,
    language: language,
    verification: verification
  });
  if (METRICS_CACHE.has(key)) return METRICS_CACHE.get(key);
  /* LOAD JSON FROM exp/* */

  var qas = (0, _utils.loadTotalQAs)({
    dataset: dataset,
    model: model,
    experiment: experiment
  });
  qas = (0, _utils.dedupeContent)(qas);
  /* FILTER language */

  if (language !== "all") {
    var lang = language.toLowerCase();
    qas = qas.filter(function (q) {
      return (0, _utils.normalizeLang)(q.language) === lang;
    });
  }

  var originalQAs = qas;
  /* FILTER verification */

  if (verification !== "all") {
    qas = qas.filter(function (q) {
      if (verification === "both") return q.verified === true && q.verified_step2 === true;
      if (verification === "bi") return q.verified === true;
      if (verification === "cross") return q.verified_step2 === true;
      return true;
    });
  }
  /* GROUP BY (language + model) */


  var groups = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = qas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var q = _step.value;

      var _lang = (0, _utils.normalizeLang)(q.language).toUpperCase();

      var mdl = (0, _utils.normalizeModel)(q.model);
      var gKey = "".concat(_lang, "|").concat(mdl);
      if (!groups.has(gKey)) groups.set(gKey, []);
      groups.get(gKey).push(q);
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

  var items = [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    var _loop = function _loop() {
      var _step2$value = _slicedToArray(_step2.value, 2),
          gKey = _step2$value[0],
          arr = _step2$value[1];

      var _gKey$split = gKey.split("|"),
          _gKey$split2 = _slicedToArray(_gKey$split, 2),
          lang = _gKey$split2[0],
          mdl = _gKey$split2[1];

      var sumBi = 0,
          sumCE = 0,
          biN = 0,
          ceN = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = arr[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _q = _step3.value;

          if (typeof _q.sim_qc === "number") {
            sumBi += _q.sim_qc;
            biN++;
          }

          if (typeof _q.ce_multi_prob === "number") {
            sumCE += _q.ce_multi_prob;
            ceN++;
          }
        }
        /* VERIFIED RATIO trên dataset gốc */

      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var originalGroup = originalQAs.filter(function (q) {
        return (0, _utils.normalizeLang)(q.language).toUpperCase() === lang && (0, _utils.normalizeModel)(q.model) === mdl;
      });
      var both = originalGroup.filter(function (q) {
        return q.verified === true && q.verified_step2 === true;
      }).length;
      var verifiedRatio = originalGroup.length === 0 ? 0 : Number((both / originalGroup.length).toFixed(3));
      items.push({
        language: lang,
        model: mapModelName(mdl),
        verification: verification,
        qaCount: arr.length,
        avgSimilarity: biN ? Number((sumBi / biN).toFixed(3)) : 0,
        avgEntailment: ceN ? Number((sumCE / ceN).toFixed(3)) : 0,
        verifiedRatio: verifiedRatio
      });
    };

    for (var _iterator2 = groups.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var result = {
    items: items
  };
  METRICS_CACHE.set(key, result);
  return result;
}