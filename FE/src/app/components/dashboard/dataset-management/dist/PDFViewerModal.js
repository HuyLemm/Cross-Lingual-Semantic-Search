"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var button_1 = require("../../ui/button");
var loading_spinner_1 = require("../../ui/loading-spinner");
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null)
        return "—";
    var units = ["B", "KB", "MB", "GB"];
    var v = bytes;
    var i = 0;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return v.toFixed(i === 0 ? 0 : 1) + " " + units[i];
}
function PDFViewerModal(_a) {
    var _b, _c, _d, _e;
    var open = _a.open, apiBase = _a.apiBase, meta = _a.meta, _f = _a.loading, loading = _f === void 0 ? false : _f, _g = _a.error, error = _g === void 0 ? null : _g, onClose = _a.onClose;
    if (!open)
        return null;
    var pdfName = (_b = meta === null || meta === void 0 ? void 0 : meta.pdfName) !== null && _b !== void 0 ? _b : "Unknown.pdf";
    var sizeText = (meta === null || meta === void 0 ? void 0 : meta.sizeBytes) !== undefined ? formatBytes(meta.sizeBytes) : "—";
    var pagesText = (_c = meta === null || meta === void 0 ? void 0 : meta.pages) !== null && _c !== void 0 ? _c : "—";
    var pageNumber = (_d = meta === null || meta === void 0 ? void 0 : meta.pageNumber) !== null && _d !== void 0 ? _d : "—";
    var chunkId = (_e = meta === null || meta === void 0 ? void 0 : meta.chunk_id) !== null && _e !== void 0 ? _e : "—";
    var pdfSrc = (meta === null || meta === void 0 ? void 0 : meta.pdfUrl) ? "" + apiBase + meta.pdfUrl : "";
    var downloadHref = (meta === null || meta === void 0 ? void 0 : meta.downloadUrl) ? "" + apiBase + meta.downloadUrl : "";
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" },
        React.createElement("div", { className: "bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden" },
            React.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700" },
                React.createElement("div", { className: "flex items-center space-x-3 min-w-0" },
                    React.createElement("div", { className: "p-2 bg-red-50 dark:bg-red-900/20 rounded" },
                        React.createElement(lucide_react_1.FileText, { className: "w-5 h-5 text-red-600 dark:text-red-400" })),
                    React.createElement("div", { className: "min-w-0" },
                        React.createElement("h3", { className: "font-medium text-gray-900 dark:text-white truncate" }, pdfName),
                        React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate" },
                            sizeText,
                            " \u2022 ",
                            pagesText,
                            " pages \u2022 Viewing page ",
                            pageNumber,
                            " \u2022 Chunk ",
                            chunkId))),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 px-3", onClick: function () {
                            if (!downloadHref)
                                return;
                            window.open(downloadHref, "_blank", "noopener,noreferrer");
                        }, disabled: !downloadHref || loading },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        "Download"),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", onClick: onClose },
                        React.createElement(lucide_react_1.X, { className: "w-5 h-5" })))),
            React.createElement("div", { className: "flex-1 bg-gray-100 dark:bg-slate-950 overflow-hidden" },
                React.createElement("div", { className: "h-full w-full p-4" },
                    React.createElement("div", { className: "h-full w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900" }, loading ? (React.createElement("div", { className: "h-full flex items-center justify-center" },
                        React.createElement(loading_spinner_1["default"], { size: 28 }))) : error ? (React.createElement("div", { className: "h-full flex items-center justify-center p-6" },
                        React.createElement("p", { className: "text-sm text-red-600 dark:text-red-400" }, error))) : !pdfSrc ? (React.createElement("div", { className: "h-full flex items-center justify-center p-6" },
                        React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-300" }, "PDF source not available."))) : (React.createElement("iframe", { title: "pdf-viewer", src: pdfSrc, className: "w-full h-full" }))))))));
}
exports["default"] = PDFViewerModal;
