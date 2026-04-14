// SearchQATesting.tsx
"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var LeftPanel_1 = require("./search-qa-testing/LeftPanel");
var MiddleTop_1 = require("./search-qa-testing/MiddleTop");
var MiddleBottom_1 = require("./search-qa-testing/MiddleBottom");
var RightPanel_1 = require("./search-qa-testing/RightPanel");
var SearchVisualization_1 = require("./search-qa-testing/SearchVisualization");
var QAPairPDFViewerModal_1 = require("./qa-validation/QAPairPDFViewerModal");
var API_BASE = "http://localhost:4000";
function SearchQATesting() {
    var _this = this;
    var _a, _b;
    var _c = react_1.useState(false), running = _c[0], setRunning = _c[1];
    var _d = react_1.useState([10]), topK = _d[0], setTopK = _d[1];
    var _e = react_1.useState("Các tạp chí uy tín nào tại Việt Nam đã công bố công trình nghiên cứu của Bệnh viện Quân y 7A?"), query = _e[0], setQuery = _e[1];
    var _f = react_1.useState(false), isPdfOpen = _f[0], setIsPdfOpen = _f[1];
    var _g = react_1.useState(null), pdfMeta = _g[0], setPdfMeta = _g[1];
    var _h = react_1.useState(false), pdfLoading = _h[0], setPdfLoading = _h[1];
    var _j = react_1.useState(null), pdfError = _j[0], setPdfError = _j[1];
    var _k = react_1.useState(null), selectedResult = _k[0], setSelectedResult = _k[1];
    var _l = react_1.useState(false), hasSearched = _l[0], setHasSearched = _l[1];
    var _m = react_1.useState(null), snapshot = _m[0], setSnapshot = _m[1];
    var _o = react_1.useState("en"), language = _o[0], setLanguage = _o[1];
    var _p = react_1.useState("opt1"), masterOption = _p[0], setMasterOption = _p[1];
    var _q = react_1.useState("minilm"), chunkEmbeddingModel = _q[0], setChunkEmbeddingModel = _q[1];
    var _r = react_1.useState("minilm"), queryEmbeddingModel = _r[0], setQueryEmbeddingModel = _r[1];
    var _s = react_1.useState("flatip_cpu"), vectorIndex = _s[0], setVectorIndex = _s[1];
    var _t = react_1.useState("faiss_cpu"), retrievalEngine = _t[0], setRetrievalEngine = _t[1];
    var _u = react_1.useState("hybrid"), reranker = _u[0], setReranker = _u[1];
    var _v = react_1.useState("heuristic"), rankingMethod = _v[0], setRankingMethod = _v[1];
    var _w = react_1.useState(""), queryUsed = _w[0], setQueryUsed = _w[1];
    var _x = react_1.useState([]), results = _x[0], setResults = _x[1];
    var _y = react_1.useState(null), error = _y[0], setError = _y[1];
    // =========================
    // APPLY MASTER OPTION
    // =========================
    var applyMasterOption = function (opt) {
        setMasterOption(opt);
        if (opt === "opt1") {
            setChunkEmbeddingModel("minilm");
            setQueryEmbeddingModel("minilm");
            setVectorIndex("flatip_cpu");
            setRetrievalEngine("faiss_cpu");
            setReranker("hybrid");
            setRankingMethod("heuristic");
        }
        else {
            setChunkEmbeddingModel("bge-m3");
            setQueryEmbeddingModel("bge-m3");
            setVectorIndex("flatip_cpu_72t");
            setRetrievalEngine("faiss_cpu_72t");
            setReranker("bge-reranker-v2-m3");
            setRankingMethod("cross_encoder");
        }
    };
    var resolveDatasetFolderFromLang = function (lang) {
        if (lang === "vi")
            return "articles_vi";
        if (lang === "en")
            return "articles_en";
        // auto => tạm dùng queryUsed language detect? hoặc default vi/en
        return "articles_vi";
    };
    var handleOpenPdfFromResult = function (r) { return __awaiter(_this, void 0, void 0, function () {
        var datasetFolder, params, res, data, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setSelectedResult(r);
                    setIsPdfOpen(true);
                    setPdfLoading(true);
                    setPdfError(null);
                    setPdfMeta(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    datasetFolder = resolveDatasetFolderFromLang(language);
                    params = new URLSearchParams();
                    params.set("dataset", datasetFolder);
                    params.set("pdf", (_a = r.file) !== null && _a !== void 0 ? _a : "");
                    // nếu backend có chunk_id thì gắn vào (optional)
                    // @ts-ignore
                    if (r.chunk_id)
                        params.set("chunk_id", String(r.chunk_id));
                    return [4 /*yield*/, fetch(API_BASE + "/qa/doc-meta?" + params.toString())];
                case 2:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _b.sent();
                    if (!res.ok)
                        throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Failed to load PDF meta");
                    setPdfMeta(data);
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _b.sent();
                    setPdfError((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || "Failed to load PDF meta");
                    return [3 /*break*/, 6];
                case 5:
                    setPdfLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // =========================
    // LOCK ranking if neural reranker
    // =========================
    react_1.useEffect(function () {
        if (reranker === "bge-reranker-v2-m3" &&
            rankingMethod !== "cross_encoder") {
            setRankingMethod("cross_encoder");
        }
    }, [reranker, rankingMethod]);
    var rankingLocked = reranker === "bge-reranker-v2-m3";
    // =========================
    // API
    // =========================
    var API_URL = "http://localhost:5000/search";
    var handleRun = function () { return __awaiter(_this, void 0, void 0, function () {
        var payload, res, txt, data, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setHasSearched(true);
                    setResults([]);
                    setQueryUsed("");
                    // Snapshot config at run time
                    setSnapshot({
                        language: language,
                        chunkEmbeddingModel: chunkEmbeddingModel,
                        queryEmbeddingModel: queryEmbeddingModel,
                        vectorIndex: vectorIndex,
                        retrievalEngine: retrievalEngine,
                        reranker: reranker,
                        rankingMethod: rankingMethod,
                        topK: topK
                    });
                    setRunning(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    payload = {
                        text: query,
                        language: language,
                        chunk_embedding_model: chunkEmbeddingModel,
                        query_embedding_model: queryEmbeddingModel,
                        vector_index: vectorIndex,
                        retrieval_engine: retrievalEngine,
                        reranker: reranker,
                        ranking_method: rankingMethod,
                        top_k: topK[0]
                    };
                    console.log(payload);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.text()];
                case 3:
                    txt = _a.sent();
                    throw new Error("API " + res.status + ": " + txt);
                case 4: return [4 /*yield*/, res.json()];
                case 5:
                    data = _a.sent();
                    console.log(data);
                    setQueryUsed(data.query_used || "");
                    setResults(Array.isArray(data.results) ? data.results : []);
                    return [3 /*break*/, 8];
                case 6:
                    e_2 = _a.sent();
                    setError((e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || "Unknown error");
                    setQueryUsed("");
                    setResults([]);
                    return [3 /*break*/, 8];
                case 7:
                    setRunning(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // =========================
    // RESET
    // =========================
    var handleReset = function () {
        setHasSearched(false);
        setSnapshot(null);
        setTopK([10]);
        setQuery("Các tạp chí uy tín nào tại Việt Nam đã công bố công trình nghiên cứu của Bệnh viện Quân y 7A?");
        setLanguage("en");
        applyMasterOption("opt1");
        setQueryUsed("");
        setResults([]);
        setError(null);
    };
    var groundTruth = {
        question: "How does attention mechanism work in transformers?",
        expectedChunkId: "chunk_001",
        expectedAnswer: "The attention mechanism allows the model to dynamically focus on different parts of the input sequence..."
    };
    return (React.createElement("div", { className: "bg-white dark:bg-slate-900 min-h-screen " },
        React.createElement("div", { className: "grid h-full min-h-0 grid-cols-[290px_1fr_auto] grid-rows-[1fr_auto]" },
            React.createElement("div", { className: "row-span-2 col-start-1 min-h-0 overflow-y-auto overflow-x-hidden" },
                React.createElement(LeftPanel_1["default"], { query: query, setQuery: setQuery, language: language, setLanguage: setLanguage, chunkEmbeddingModel: chunkEmbeddingModel, setChunkEmbeddingModel: setChunkEmbeddingModel, queryEmbeddingModel: queryEmbeddingModel, setQueryEmbeddingModel: setQueryEmbeddingModel, vectorIndex: vectorIndex, setVectorIndex: setVectorIndex, retrievalEngine: retrievalEngine, setRetrievalEngine: setRetrievalEngine, reranker: reranker, setReranker: setReranker, rankingMethod: rankingMethod, setRankingMethod: setRankingMethod, rankingLocked: rankingLocked, topK: topK, setTopK: setTopK, running: running, error: error, onRun: handleRun, onReset: handleReset, masterOption: masterOption, onSelectMasterOption: applyMasterOption })),
            React.createElement("div", { className: [
                    "row-start-1 col-start-2 min-h-0 grid overflow-hidden",
                    "grid-rows-[auto_700px]",
                ].join(" ") },
                React.createElement("div", { className: "min-h-0 overflow-hidden" },
                    React.createElement(MiddleTop_1["default"], { groundTruth: groundTruth })),
                React.createElement("div", { className: "min-h-0 overflow-y-auto overflow-x-hidden" },
                    React.createElement(MiddleBottom_1["default"], { results: results, queryUsed: queryUsed, query: query, running: running, hasSearched: hasSearched, onOpenPdf: handleOpenPdfFromResult }))),
            React.createElement("div", { className: "row-start-1 col-start-3 min-h-0 overflow-hidden" },
                React.createElement(RightPanel_1["default"], { snapshot: snapshot, returned: results.length })),
            React.createElement("div", { className: "row-start-2 col-start-2 col-span-2 border-t border-gray-200 dark:border-slate-700 overflow-hidden" },
                React.createElement("div", { className: "h-full overflow-y-auto p-6" },
                    React.createElement(SearchVisualization_1["default"], null))),
            isPdfOpen && selectedResult && (React.createElement(QAPairPDFViewerModal_1["default"]
            // @ts-ignore - adapter nhanh, hoặc bạn sửa modal cho accept result
            , { 
                // @ts-ignore - adapter nhanh, hoặc bạn sửa modal cho accept result
                qa: {
                    id: "search-result",
                    sourceDocument: (_a = selectedResult.file) !== null && _a !== void 0 ? _a : "",
                    // @ts-ignore
                    chunk_id: (_b = selectedResult.chunk_id) !== null && _b !== void 0 ? _b : null,
                    language: language === "auto" ? "vi" : language,
                    question: queryUsed || query,
                    answer: ""
                }, meta: pdfMeta, loading: pdfLoading, error: pdfError, onClose: function () {
                    setIsPdfOpen(false);
                    setPdfMeta(null);
                    setPdfError(null);
                    setSelectedResult(null);
                } })))));
}
exports["default"] = SearchQATesting;
