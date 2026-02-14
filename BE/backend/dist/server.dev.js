"use strict";

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _summaryRoutes = _interopRequireDefault(require("./routes/summary.routes.js"));

var _datasetEvalRoutes = _interopRequireDefault(require("./routes/datasetEval.routes.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
app.use((0, _cors["default"])());
app.use(_express["default"].json()); // routes

app.use('/summary', _summaryRoutes["default"]);
app.use('/dataset-eval', _datasetEvalRoutes["default"]);
var PORT = 4000;
app.listen(PORT, function () {
  console.log("\uD83D\uDE80 Backend running at http://localhost:".concat(PORT));
});