"use strict";
exports.__esModule = true;
var card_1 = require("@/app/components/ui/card");
var button_1 = require("@/app/components/ui/button");
var lucide_react_1 = require("lucide-react");
function LanguageSelector(_a) {
    var selectedLanguage = _a.selectedLanguage, onLanguageChange = _a.onLanguageChange;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardContent, { className: "pt-6" },
            React.createElement("div", { className: "flex items-center justify-center space-x-4" },
                React.createElement(lucide_react_1.Globe, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }),
                React.createElement("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "Select Language:"),
                React.createElement("div", { className: "flex space-x-2" },
                    React.createElement(button_1.Button, { variant: selectedLanguage === 'english' ? 'default' : 'outline', onClick: function () { return onLanguageChange('english'); }, className: "px-6" }, "English"),
                    React.createElement(button_1.Button, { variant: selectedLanguage === 'vietnamese' ? 'default' : 'outline', onClick: function () { return onLanguageChange('vietnamese'); }, className: "px-6" }, "Vietnamese"))))));
}
exports["default"] = LanguageSelector;
