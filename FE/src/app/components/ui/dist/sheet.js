"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.SheetDescription = exports.SheetTitle = exports.SheetHeader = exports.SheetContent = exports.Sheet = void 0;
var React = require("react");
var SheetPrimitive = require("@radix-ui/react-dialog");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("./utils");
function Sheet(props) {
    return React.createElement(SheetPrimitive.Root, __assign({}, props));
}
exports.Sheet = Sheet;
function SheetPortal(props) {
    return React.createElement(SheetPrimitive.Portal, __assign({}, props));
}
function SheetOverlay(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Overlay, __assign({ className: utils_1.cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className) }, props)));
}
function SheetContent(_a) {
    var className = _a.className, children = _a.children, _b = _a.side, side = _b === void 0 ? "right" : _b, props = __rest(_a, ["className", "children", "side"]);
    return (React.createElement(SheetPortal, null,
        React.createElement(SheetOverlay, null),
        React.createElement(SheetPrimitive.Content, __assign({ className: utils_1.cn("fixed z-50 flex flex-col gap-4 bg-background shadow-xl transition-all", side === "right" &&
                "inset-y-0 right-0 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right", side === "left" &&
                "inset-y-0 left-0 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left", side === "top" &&
                "inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top", side === "bottom" &&
                "inset-x-0 bottom-0 border-t data-[state=open]:slide-in-from-bottom", className) }, props),
            children,
            React.createElement(SheetPrimitive.Close, { className: "absolute top-4 right-4 opacity-70 hover:opacity-100" },
                React.createElement(lucide_react_1.XIcon, { className: "w-4 h-4" })))));
}
exports.SheetContent = SheetContent;
function SheetHeader(props) {
    return React.createElement("div", __assign({ className: "p-4 border-b" }, props));
}
exports.SheetHeader = SheetHeader;
function SheetTitle(props) {
    return React.createElement(SheetPrimitive.Title, __assign({ className: "font-semibold" }, props));
}
exports.SheetTitle = SheetTitle;
function SheetDescription(props) {
    return React.createElement(SheetPrimitive.Description, __assign({ className: "text-sm text-muted-foreground" }, props));
}
exports.SheetDescription = SheetDescription;
