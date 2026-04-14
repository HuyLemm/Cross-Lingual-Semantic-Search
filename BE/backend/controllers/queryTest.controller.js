import { loadQueryTestResults } from "../services/queryTest.service.js";

export function getQueryTestResults(req, res) {
  try {
    const baseDir =
      typeof req.query.baseDir === "string" ? req.query.baseDir : undefined;

    const data = loadQueryTestResults(baseDir);

    // nếu muốn status code rõ ràng:
    if (!data.ok) {
      return res.status(404).json(data);
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
      detail: String(err?.message || err),
    });
  }
}