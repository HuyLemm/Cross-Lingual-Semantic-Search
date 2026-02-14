import { buildDatasetEvalMetrics } from "../services/datasetEval.service.js";

export function getDatasetEvalMetrics(req, res) {
  try {
    // Normalize query (tránh undefined / array / casing)
    const query = {
      dataset: String(req.query.dataset || "all"),
      model: String(req.query.model || "all"),
      experiment: String(req.query.experiment || "all"),
      language: String(req.query.language || "all"),
      verification: String(req.query.verification || "both"),
    };

    const result = buildDatasetEvalMetrics(query);

    return res.json(result);
  } catch (err) {
    console.error("[dataset-eval] error:", err);
    return res.status(500).json({
      error: "Failed to build dataset evaluation metrics",
    });
  }
}
