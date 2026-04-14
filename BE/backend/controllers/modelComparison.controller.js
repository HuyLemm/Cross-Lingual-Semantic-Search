import { loadModelComparisonSummary } from "../services/modelComparison-summary.service.js";
import { loadModelComparisonRawTable } from "../services/modelComparison-metrics.service.js";
import { loadModelComparisonCharts } from "../services/modelComparison-charts.service.js";

export async function getModelComparison(req, res) {
  try {
    const baseDirOverride = req.query?.baseDir; // optional
    const data = loadModelComparisonSummary(baseDirOverride);

    return res.status(200).json({
      ok: true,
      ...data, // { summaryCards, table5Rows }
    });
  } catch (err) {
    console.error("getModelComparison error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load model comparison summary",
      error: String(err?.message || err),
    });
  }
}

export async function getModelComparisonRawTable(req, res) {
  try {
    const baseDirOverride = req.query?.baseDir;
    const data = loadModelComparisonRawTable(baseDirOverride);
    return res.status(200).json(data);
  } catch (err) {
    console.error("getModelComparisonRawTable error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load raw model comparison table",
      error: String(err?.message || err),
    });
  }
}

export async function getModelComparisonCharts(req, res) {
  try {
    const baseDirOverride = req.query?.baseDir;

    const data = loadModelComparisonCharts(baseDirOverride);

    return res.status(200).json(data);
  } catch (err) {
    console.error("getModelComparisonCharts error:", err);

    return res.status(500).json({
      ok: false,
      message: "Failed to load charts data",
    });
  }
}