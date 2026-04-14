import express from "express";
import { getOption2SummaryApi } from "../controllers/option2.controller.js";
import { getOption2ModelComparisonController } from "../controllers/option2.controller.js";
import { option2LanguageMatrixController } from "../controllers/option2.controller.js";
import { option2LatencyController } from "../controllers/option2.controller.js";
import { option2TablesController } from "../controllers/option2.controller.js";

const router = express.Router();

// GET /api/evaluation/option1/summary
router.get("/option2/summary", getOption2SummaryApi);
router.get("/option2/model-comparison", getOption2ModelComparisonController);
router.get("/option2/language-matrix", option2LanguageMatrixController);
router.get("/option2/latency", option2LatencyController);
router.get("/option2/tables", option2TablesController);

export default router;