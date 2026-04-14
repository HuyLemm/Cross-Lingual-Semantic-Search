import express from "express";
import { getOption1SummaryApi } from "../controllers/option1.controller.js";
import { getOption1ModelComparisonController } from "../controllers/option1.controller.js";
import { option1LanguageMatrixController } from "../controllers/option1.controller.js";
import { option1LatencyController } from "../controllers/option1.controller.js";
import { option1TablesController } from "../controllers/option1.controller.js";

const router = express.Router();

// GET /api/evaluation/option1/summary
router.get("/option1/summary", getOption1SummaryApi);
router.get("/option1/model-comparison", getOption1ModelComparisonController);
router.get("/option1/language-matrix", option1LanguageMatrixController);
router.get("/option1/latency", option1LatencyController);
router.get("/option1/tables", option1TablesController);

export default router;