import express from "express";
import { getDatasetEvalMetrics } from "../controllers/datasetEval.controller.js";

const router = express.Router();

/**
 * Dataset Evaluation Metrics
 *
 * FE usage:
 *  - Header filters
 *  - DatasetMetricsChart
 *  - DatasetStatisticsTable
 *  - DatasetInsightCards
 *
 * Query params:
 *  - dataset=all|en|vi
 *  - model=all|gpt|gemini|deepseek
 *  - experiment=all|exp1|exp2|...
 *  - verification=all|bi|cross|both
 *
 * Response:
 * {
 *   items: [
 *     {
 *       language: "EN",
 *       model: "GPT",
 *       verification: "both",
 *       qaCount: 7021,
 *       avgSimilarity: 0.861,
 *       avgEntailment: 0.842,
 *       verifiedRatio: 0.787
 *     }
 *   ]
 * }
 */
router.get("/metrics", getDatasetEvalMetrics);

export default router;
