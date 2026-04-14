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
var card_1 = require("../../ui/card");
var lucide_react_1 = require("lucide-react");
var button_1 = require("../../ui/button");
var input_1 = require("../../ui/input");
var react_1 = require("react");
var PDFViewerModal_1 = require("./PDFViewerModal");
function formatBytes(bytes) {
    if (!Number.isFinite(bytes))
        return "0 B";
    var units = ["B", "KB", "MB", "GB", "TB"];
    var b = bytes;
    var i = 0;
    while (b >= 1024 && i < units.length - 1) {
        b /= 1024;
        i++;
    }
    return b.toFixed(i === 0 ? 0 : 1) + " " + units[i];
}
function toDateLabel(iso) {
    var d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return "";
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
}
/** Pagination kiểu: 1 … 12 13 14 … 43 */
function buildPagination(current, total) {
    if (total <= 7)
        return Array.from({ length: total }, function (_, i) { return i + 1; });
    var clamp = function (x) { return Math.max(1, Math.min(total, x)); };
    var c = clamp(current);
    var items = [];
    var first = 1;
    var last = total;
    var left = Math.max(2, c - 1);
    var right = Math.min(total - 1, c + 1);
    items.push(first);
    if (left > 2)
        items.push("ellipsis");
    for (var p = left; p <= right; p++)
        items.push(p);
    if (right < total - 1)
        items.push("ellipsis");
    items.push(last);
    return items;
}
/** highlight keyword in text */
function HighlightText(_a) {
    var text = _a.text, query = _a.query;
    var q = query.trim();
    if (!q)
        return React.createElement(React.Fragment, null, text);
    var lowerText = text.toLowerCase();
    var lowerQ = q.toLowerCase();
    var parts = [];
    var start = 0;
    while (true) {
        var idx = lowerText.indexOf(lowerQ, start);
        if (idx === -1)
            break;
        if (idx > start)
            parts.push(text.slice(start, idx));
        var match = text.slice(idx, idx + q.length);
        parts.push(React.createElement("mark", { key: idx + "-" + match, className: "px-1 rounded bg-yellow-200/70 dark:bg-yellow-500/30 text-gray-900 dark:text-white" }, match));
        start = idx + q.length;
    }
    if (start < text.length)
        parts.push(text.slice(start));
    return React.createElement(React.Fragment, null, parts);
}
function PDFFilesList(_a) {
    var _this = this;
    var selectedLanguage = _a.selectedLanguage, apiBase = _a.apiBase;
    var _b = react_1.useState([]), rawFiles = _b[0], setRawFiles = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(null), error = _d[0], setError = _d[1];
    var _e = react_1.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState(1), currentPage = _f[0], setCurrentPage = _f[1];
    // ✅ PDF modal meta
    var _g = react_1.useState(false), isPdfOpen = _g[0], setIsPdfOpen = _g[1];
    var _h = react_1.useState(null), pdfMeta = _h[0], setPdfMeta = _h[1];
    var _j = react_1.useState(false), pdfLoading = _j[0], setPdfLoading = _j[1];
    var _k = react_1.useState(null), pdfError = _k[0], setPdfError = _k[1];
    var itemsPerPage = 5;
    var datasetFolder = selectedLanguage === "vietnamese" ? "articles_vi" : "articles_en";
    function fetchFiles(lang) {
        return __awaiter(this, void 0, void 0, function () {
            var res, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        setLoading(true);
                        setError(null);
                        return [4 /*yield*/, fetch(apiBase + "/dataset/list?language=" + lang, {
                                cache: "no-store"
                            })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("HTTP " + res.status);
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = (_a.sent());
                        setRawFiles(Array.isArray(data.files) ? data.files : []);
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _a.sent();
                        console.error("Failed to load pdf list:", e_1);
                        setRawFiles([]);
                        setError((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) ? String(e_1.message) : "Failed to load data");
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    react_1.useEffect(function () {
        setSearchQuery("");
        setCurrentPage(1);
        fetchFiles(selectedLanguage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage]);
    var files = react_1.useMemo(function () {
        return rawFiles.map(function (f) {
            var _a, _b;
            return ({
                id: f.relativePath || f.name,
                name: f.name,
                sizeBytes: (_a = f.sizeBytes) !== null && _a !== void 0 ? _a : 0,
                sizeLabel: formatBytes((_b = f.sizeBytes) !== null && _b !== void 0 ? _b : 0),
                pages: null,
                date: toDateLabel(f.updatedAt || ""),
                category: "PDF",
                relativePath: f.relativePath
            });
        });
    }, [rawFiles]);
    var filteredFiles = react_1.useMemo(function () {
        var q = searchQuery.trim().toLowerCase();
        if (!q)
            return files;
        return files.filter(function (file) {
            return file.name.toLowerCase().includes(q) ||
                file.category.toLowerCase().includes(q);
        });
    }, [files, searchQuery]);
    var totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
    react_1.useEffect(function () {
        if (currentPage > totalPages)
            setCurrentPage(totalPages);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalPages]);
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var paginatedFiles = filteredFiles.slice(startIndex, endIndex);
    var handleSearchChange = function (value) {
        setSearchQuery(value);
        setCurrentPage(1);
    };
    // ✅ 1) CHỈ fetch meta, KHÔNG mở modal
    function fetchDocMetaOnly(pdfName) {
        return __awaiter(this, void 0, Promise, function () {
            var params, res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams();
                        params.set("dataset", datasetFolder);
                        params.set("pdf", pdfName);
                        return [4 /*yield*/, fetch(apiBase + "/qa/doc-meta?" + params.toString())];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        if (!res.ok)
                            throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Failed to load PDF meta");
                        return [2 /*return*/, data];
                }
            });
        });
    }
    // ✅ 2) View = mở modal + load meta
    function openPdfModal(pdfName) {
        return __awaiter(this, void 0, void 0, function () {
            var meta, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsPdfOpen(true);
                        setPdfLoading(true);
                        setPdfError(null);
                        setPdfMeta(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, fetchDocMetaOnly(pdfName)];
                    case 2:
                        meta = _a.sent();
                        setPdfMeta(meta);
                        return [3 /*break*/, 5];
                    case 3:
                        e_2 = _a.sent();
                        setPdfError((e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || "Failed to load PDF meta");
                        return [3 /*break*/, 5];
                    case 4:
                        setPdfLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    var handleView = function (file) {
        openPdfModal(file.name);
    };
    // ✅ 3) Download = fetch meta rồi open downloadUrl, KHÔNG mở modal
    var handleDownload = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var meta, href, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchDocMetaOnly(file.name)];
                case 1:
                    meta = _a.sent();
                    href = (meta === null || meta === void 0 ? void 0 : meta.downloadUrl) ? "" + apiBase + meta.downloadUrl : "";
                    if (href)
                        window.open(href, "_blank", "noopener,noreferrer");
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    console.error(e_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(React.Fragment, null,
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "flex items-center justify-between gap-4" },
                    React.createElement(card_1.CardTitle, { className: "min-w-0" },
                        selectedLanguage === "english" ? "English" : "Vietnamese",
                        " PDF Documents",
                        " ",
                        React.createElement("span", { className: "text-gray-500 dark:text-gray-400" },
                            "(",
                            filteredFiles.length,
                            ")")),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return fetchFiles(selectedLanguage); }, disabled: loading, className: "h-9" },
                            React.createElement(lucide_react_1.RefreshCcw, { className: "w-4 h-4 mr-2" }),
                            "Refresh"),
                        React.createElement("div", { className: "relative w-80" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
                            React.createElement(input_1.Input, { type: "text", placeholder: "Search by filename...", value: searchQuery, onChange: function (e) { return handleSearchChange(e.target.value); }, className: "pl-10 h-9" })))),
                error && (React.createElement("div", { className: "mt-2 text-sm text-red-600 dark:text-red-400" }, error))),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-3" }, loading ? (React.createElement("div", { className: "text-center py-12 text-gray-500 dark:text-gray-400" }, "Loading documents...")) : paginatedFiles.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-gray-500 dark:text-gray-400" },
                    React.createElement(lucide_react_1.FileText, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }),
                    React.createElement("p", null, "No documents found matching your search."))) : (paginatedFiles.map(function (file) { return (React.createElement("div", { key: file.id, className: "flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors" },
                    React.createElement("div", { className: "flex items-start space-x-4 flex-1 min-w-0" },
                        React.createElement("div", { className: "p-2 bg-red-50 dark:bg-red-900/20 rounded" },
                            React.createElement(lucide_react_1.FileText, { className: "w-5 h-5 text-red-600 dark:text-red-400" })),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-white truncate" },
                                React.createElement(HighlightText, { text: file.name, query: searchQuery })),
                            React.createElement("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2 mt-2" },
                                React.createElement("div", { className: "flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400" },
                                    React.createElement(lucide_react_1.HardDrive, { className: "w-3 h-3" }),
                                    React.createElement("span", null, file.sizeLabel)),
                                React.createElement("div", { className: "flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400" },
                                    React.createElement(lucide_react_1.Calendar, { className: "w-3 h-3" }),
                                    React.createElement("span", null, file.date || "—")),
                                React.createElement("div", { className: "px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded" },
                                    React.createElement(HighlightText, { text: file.category, query: searchQuery }))))),
                    React.createElement("div", { className: "flex items-center space-x-2 ml-4" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 px-3", onClick: function () { return handleView(file); } },
                            React.createElement(lucide_react_1.Eye, { className: "w-3 h-3 mr-1" }),
                            "View"),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 px-3", onClick: function () { return handleDownload(file); } },
                            React.createElement(lucide_react_1.Download, { className: "w-3 h-3 mr-1" }),
                            "Download")))); }))),
                !loading && filteredFiles.length > 0 && (React.createElement("div", { className: "flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-slate-700" },
                    React.createElement("div", { className: "text-sm text-gray-600 dark:text-gray-400" },
                        "Showing ",
                        startIndex + 1,
                        " to ",
                        Math.min(endIndex, filteredFiles.length),
                        " of",
                        " ",
                        filteredFiles.length,
                        " documents"),
                    React.createElement("div", { className: "flex items-center space-x-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(function (prev) { return Math.max(1, prev - 1); }); }, disabled: currentPage === 1, className: "h-8 px-3" },
                            React.createElement(lucide_react_1.ChevronLeft, { className: "w-4 h-4 mr-1" }),
                            "Previous"),
                        React.createElement("div", { className: "flex items-center space-x-1" }, buildPagination(currentPage, totalPages).map(function (item, idx) {
                            if (item === "ellipsis") {
                                return (React.createElement("span", { key: "e-" + idx, className: "px-2 text-sm text-gray-500 dark:text-gray-400" }, "\u2026"));
                            }
                            var page = item;
                            return (React.createElement(button_1.Button, { key: page, variant: currentPage === page ? "default" : "outline", size: "sm", onClick: function () { return setCurrentPage(page); }, className: "h-8 w-8 p-0" }, page));
                        })),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(function (prev) { return Math.min(totalPages, prev + 1); }); }, disabled: currentPage === totalPages, className: "h-8 px-3" },
                            "Next",
                            React.createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4 ml-1" }))))))),
        React.createElement(PDFViewerModal_1["default"], { open: isPdfOpen, apiBase: apiBase, meta: pdfMeta, loading: pdfLoading, error: pdfError, onClose: function () {
                setIsPdfOpen(false);
                setPdfMeta(null);
                setPdfError(null);
            } })));
}
exports["default"] = PDFFilesList;
