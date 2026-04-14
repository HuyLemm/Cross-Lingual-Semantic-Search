// app/(whatever)/backend/controllers/qaEvaluation.controller.js

import { buildModelSectionData } from "../services/qaEvaluation.service.js";

/**
 * GET /qa-eval/model-section
 * Query:
 *  - modelId: "gpt-5.2" | "gemini-2.5" | "deepseek-r1t2"
 *  - dataset: "all" | "semantic_scholar" | "vjol"   (optional)
 *  - experiment: "all" | "exp1" | "exp2" ...        (optional)
 *  - threshold: "0.80" (string)                     (optional)
 */
export function getModelSection(req, res) {
  try {
    const payload = buildModelSectionData(req.query);
    return res.json(payload);
  } catch (err) {
    console.error("❌ getModelSection error:", err);
    return res.status(500).json({
      error: "Failed to build model section data",
      message: err?.message || String(err),
    });
  }
}