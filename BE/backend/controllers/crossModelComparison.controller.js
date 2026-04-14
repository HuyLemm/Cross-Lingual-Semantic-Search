// backend/controllers/crossModelComparison.controller.js
import { buildCrossModelComparison } from "../services/crossModelComparison.service.js";

export function getCrossModelComparison(req, res) {
  try {
    const data = buildCrossModelComparison(req.query || {});
    res.json(data);
  } catch (e) {
    console.error("getCrossModelComparison error:", e);
    res.status(500).send(String(e?.message || e));
  }
}