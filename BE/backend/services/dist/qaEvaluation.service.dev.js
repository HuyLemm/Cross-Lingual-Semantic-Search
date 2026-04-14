"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildModelSectionData = buildModelSectionData;
exports.clearQAEvalCaches = clearQAEvalCaches;

var _utils = require("../utils/utils.js");

// app/(whatever)/backend/services/qaEvaluation.service.js

/**
 * =========================
 * CACHE
 * =========================
 * Cache theo dataset/model/experiment vì load JSON khá nặng
 */
var QA_CACHE = new Map(); // key -> deduped qas[]

var MODEL_SECTION_CACHE = new Map(); // key -> computed payload (include threshold)

function qaCacheKey(_ref) {
  var dataset = _ref.dataset,
      model = _ref.model,
      experiment = _ref.experiment;
  return "".concat(dataset, "||").concat(model, "||").concat(experiment);
}

function modelSectionCacheKey(_ref2) {
  var dataset = _ref2.dataset,
      model = _ref2.model,
      experiment = _ref2.experiment,
      threshold = _ref2.threshold;
  return "".concat(dataset, "||").concat(model, "||").concat(experiment, "||").concat(threshold);
}
/**
 * Frontend modelId:
 *  - "gpt-5.2"
 *  - "gemini-2.5"
 *  - "deepseek-r1t2"
 * Utils normalizeModel() của bạn đang trả: gpt/gemini/deepseek
 */


function normalizeModelIdToGroup(modelId) {
  var m = String(modelId || "").toLowerCase();
  if (m.includes("deepseek")) return "deepseek";
  if (m.includes("gemini")) return "gemini";
  if (m.includes("gpt")) return "gpt";
  return "all";
}

function getModelMeta(modelId) {
  var m = String(modelId || "").toLowerCase();

  if (m.includes("gpt")) {
    return {
      name: "GPT-5.2",
      verification: "Bi + Cross"
    };
  }

  if (m.includes("gemini")) {
    return {
      name: "Gemini 2.5 Flash",
      verification: "Cross only"
    };
  }

  if (m.includes("deepseek")) {
    return {
      name: "DeepSeek R1T2",
      verification: "Bi + Cross"
    };
  }

  return {
    name: String(modelId || "Unknown"),
    verification: "Unknown"
  };
}
/**
 * =========================
 * LOAD + DEDUPE (CACHED)
 * =========================
 */


function getQAsCached(_ref3) {
  var _ref3$dataset = _ref3.dataset,
      dataset = _ref3$dataset === void 0 ? "all" : _ref3$dataset,
      _ref3$model = _ref3.model,
      model = _ref3$model === void 0 ? "all" : _ref3$model,
      _ref3$experiment = _ref3.experiment,
      experiment = _ref3$experiment === void 0 ? "all" : _ref3$experiment;
  var key = qaCacheKey({
    dataset: dataset,
    model: model,
    experiment: experiment
  });
  if (QA_CACHE.has(key)) return QA_CACHE.get(key);
  var qas = (0, _utils.loadTotalQAs)({
    dataset: dataset,
    model: model,
    experiment: experiment
  }); // Dedup theo source_pdf + question (y như utils)

  qas = (0, _utils.dedupeContent)(qas);
  QA_CACHE.set(key, qas);
  return qas;
}
/**
 * =========================
 * SCORE HELPERS
 * =========================
 */


function safeNum(x) {
  var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeLang2(raw) {
  var s = String(raw || "").toLowerCase();
  if (s.startsWith("en")) return "EN";
  if (s.startsWith("vi")) return "VI";
  return "UNK";
}
/**
 * Partition theo threshold:
 * - verified: sim>=th && ce>=th
 * - simFail: sim<th  && ce>=th
 * - entFail: sim>=th && ce<th
 * - bothFail: sim<th  && ce<th
 */


function classifyByThreshold(qa, th) {
  var sim = safeNum(qa.sim_qc, 0);
  var ce = safeNum(qa.ce_multi_prob, 0);
  var simOk = sim >= th;
  var ceOk = ce >= th;
  if (simOk && ceOk) return "verified";
  if (!simOk && ceOk) return "simFail";
  if (simOk && !ceOk) return "entFail";
  return "bothFail";
}
/**
 * =========================
 * MAIN BUILDER FOR ModelSection.tsx
 * =========================
 * Return shape MATCH đúng mock data cũ:
 * {
 *   name, verification,
 *   metrics: { total, passedSimilarity, passedEntailment, verified },
 *   chartData: [{language, similarity, entailment, verifiedRatio}],
 *   pieData: [{name,value,color}],
 *   thresholdData: [{threshold, verified, similarity, entailment}],
 *   errorDistribution: [{language, verified, simFail, entFail, bothFail}],
 *   tableData: [{language, qaCount, avgSimilarity, avgEntailment, verified, step1Only, failed}]
 * }
 */


function buildModelSectionData(query) {
  var _query$modelId = query.modelId,
      modelId = _query$modelId === void 0 ? "gpt-5.2" : _query$modelId,
      _query$dataset = query.dataset,
      dataset = _query$dataset === void 0 ? "all" : _query$dataset,
      _query$experiment = query.experiment,
      experiment = _query$experiment === void 0 ? "all" : _query$experiment,
      _query$threshold = query.threshold,
      threshold = _query$threshold === void 0 ? "0.80" : _query$threshold;

  var th = function () {
    var n = Number(threshold);
    return Number.isFinite(n) ? n : 0.8;
  }();

  var modelGroup = normalizeModelIdToGroup(modelId);
  var cacheKey = modelSectionCacheKey({
    dataset: dataset,
    model: modelGroup,
    experiment: experiment,
    threshold: th
  });
  if (MODEL_SECTION_CACHE.has(cacheKey)) return MODEL_SECTION_CACHE.get(cacheKey);
  var meta = getModelMeta(modelId); // 1) load + dedupe

  var qas = getQAsCached({
    dataset: dataset,
    model: modelGroup,
    experiment: experiment
  }); // 2) metrics (score-based)

  var total = qas.length;
  var passedSimilarity = qas.filter(function (q) {
    return safeNum(q.sim_qc, 0) >= th;
  }).length;
  var passedEntailment = qas.filter(function (q) {
    return safeNum(q.ce_multi_prob, 0) >= th;
  }).length;
  var verified = qas.filter(function (q) {
    return safeNum(q.sim_qc, 0) >= th && safeNum(q.ce_multi_prob, 0) >= th;
  }).length; // 3) pie breakdown (score-based partition)

  var step1Only = 0; // sim pass, ce fail

  var step2Only = 0; // sim fail, ce pass

  var failedBoth = 0; // both fail

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = qas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var q = _step.value;
      var cls = classifyByThreshold(q, th);
      if (cls === "entFail") step1Only++;else if (cls === "simFail") step2Only++;else if (cls === "bothFail") failedBoth++;
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

  var pieData = [{
    name: "Verified",
    value: verified,
    color: "#a855f7"
  }, {
    name: "Step1 Only",
    value: step1Only,
    color: "#3b82f6"
  }, {
    name: "Step2 Only",
    value: step2Only,
    color: "#10b981"
  }, {
    name: "Failed Both",
    value: failedBoth,
    color: "#ef4444"
  }]; // 4) per-language bucket

  var byLang = {
    EN: [],
    VI: []
  };
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = qas[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _q = _step2.value;
      var lang = normalizeLang2(_q.language);
      if (lang === "EN") byLang.EN.push(_q);else if (lang === "VI") byLang.VI.push(_q);
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

  function avg(arr, getter) {
    if (!arr.length) return 0;
    var s = arr.reduce(function (acc, x) {
      return acc + getter(x);
    }, 0);
    return s / arr.length;
  } // chartData: avg sim/ce + verified ratio theo language


  var chartData = ["EN", "VI"].map(function (L) {
    var arr = byLang[L] || [];
    var qaCount = arr.length;
    var avgSim = avg(arr, function (q) {
      return safeNum(q.sim_qc, 0);
    });
    var avgCE = avg(arr, function (q) {
      return safeNum(q.ce_multi_prob, 0);
    });
    var verCount = arr.filter(function (q) {
      return safeNum(q.sim_qc, 0) >= th && safeNum(q.ce_multi_prob, 0) >= th;
    }).length;
    var verifiedRatio = qaCount === 0 ? 0 : verCount / qaCount;
    return {
      language: L,
      similarity: Number(avgSim.toFixed(3)),
      entailment: Number(avgCE.toFixed(3)),
      verifiedRatio: Number(verifiedRatio.toFixed(3))
    };
  }); // errorDistribution: partition theo language dựa trên threshold

  var errorDistribution = ["EN", "VI"].map(function (L) {
    var arr = byLang[L] || [];
    var cVerified = 0,
        cSimFail = 0,
        cEntFail = 0,
        cBothFail = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = arr[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var q = _step3.value;
        var cls = classifyByThreshold(q, th);
        if (cls === "verified") cVerified++;else if (cls === "simFail") cSimFail++;else if (cls === "entFail") cEntFail++;else cBothFail++;
      }
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

    return {
      language: L,
      verified: cVerified,
      simFail: cSimFail,
      entFail: cEntFail,
      bothFail: cBothFail
    };
  }); // tableData: verified%, step1Only%, failed% theo language

  var tableData = ["EN", "VI"].map(function (L) {
    var arr = byLang[L] || [];
    var qaCount = arr.length;
    var avgSim = avg(arr, function (q) {
      return safeNum(q.sim_qc, 0);
    });
    var avgCE = avg(arr, function (q) {
      return safeNum(q.ce_multi_prob, 0);
    });
    var cVerified = 0,
        cStep1Only = 0,
        cFailed = 0;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = arr[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var q = _step4.value;
        var cls = classifyByThreshold(q, th);
        if (cls === "verified") cVerified++;else if (cls === "entFail" || cls === "simFail") cStep1Only++; // “step1 only %” = fail 1 side (giữ gần mock)
        else cFailed++; // bothFail
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
          _iterator4["return"]();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    var verifiedPct = qaCount === 0 ? 0 : cVerified / qaCount * 100;
    var step1OnlyPct = qaCount === 0 ? 0 : cStep1Only / qaCount * 100;
    var failedPct = qaCount === 0 ? 0 : cFailed / qaCount * 100;
    return {
      language: L,
      qaCount: qaCount,
      avgSimilarity: Number(avgSim.toFixed(3)),
      avgEntailment: Number(avgCE.toFixed(3)),
      verified: Number(verifiedPct.toFixed(1)),
      step1Only: Number(step1OnlyPct.toFixed(1)),
      failed: Number(failedPct.toFixed(1))
    };
  }); // 5) threshold curve data

  var thresholds = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9];
  var thresholdData = thresholds.map(function (t) {
    var tot = total || 1;
    var simPass = qas.filter(function (q) {
      return safeNum(q.sim_qc, 0) >= t;
    }).length;
    var cePass = qas.filter(function (q) {
      return safeNum(q.ce_multi_prob, 0) >= t;
    }).length;
    var bothPass = qas.filter(function (q) {
      return safeNum(q.sim_qc, 0) >= t && safeNum(q.ce_multi_prob, 0) >= t;
    }).length;
    return {
      threshold: t,
      verified: Number((bothPass / tot * 100).toFixed(1)),
      similarity: Number((simPass / tot * 100).toFixed(1)),
      entailment: Number((cePass / tot * 100).toFixed(1))
    };
  });
  var result = {
    modelId: modelId,
    name: meta.name,
    verification: meta.verification,
    // KPI
    metrics: {
      total: total,
      passedSimilarity: passedSimilarity,
      passedEntailment: passedEntailment,
      verified: verified
    },
    // charts
    chartData: chartData,
    pieData: pieData,
    thresholdData: thresholdData,
    errorDistribution: errorDistribution,
    tableData: tableData,
    // helpful debug / frontend optional
    qualityThreshold: th,
    dataset: dataset,
    experiment: experiment
  };
  MODEL_SECTION_CACHE.set(cacheKey, result);
  return result;
}
/**
 * Optional: clear caches nếu bạn muốn reload khi update JSON
 */


function clearQAEvalCaches() {
  QA_CACHE.clear();
  MODEL_SECTION_CACHE.clear();
}