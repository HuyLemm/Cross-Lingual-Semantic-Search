"use strict";
exports.__esModule = true;
function LoadingSpinner(_a) {
    var _b = _a.size, size = _b === void 0 ? 20 : _b;
    return (React.createElement("div", { className: "flex items-center justify-center" },
        React.createElement("div", { style: { width: size, height: size }, className: "animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-700 dark:border-t-white" })));
}
exports["default"] = LoadingSpinner;
