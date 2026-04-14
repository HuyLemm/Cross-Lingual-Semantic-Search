import { Router } from "express";
import { getModelComparison, getModelComparisonRawTable, getModelComparisonCharts } from "../controllers/modelComparison.controller.js";

const router = Router();

router.get("/model-comparison", getModelComparison);
router.get("/model-comparison-metrics", getModelComparisonRawTable);
router.get("/model-comparison-charts", getModelComparisonCharts);

export default router;