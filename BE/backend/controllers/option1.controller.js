import { getOption1Summary } from "../services/option1-summary.service.js";
import { getOption1ModelComparison } from "../services/option1-ModelComparison.service.js"
import { getOption1LanguageMatrix } from "../services/option1-Language.service.js";
import { getOption1LatencySummary } from "../services/option1-Latency.service.js";
import { getOption1TablesSummary } from "../services/option1-Tables.service.js";

export async function getOption1SummaryApi(req, res) {
  try {
    // (optional) nếu sau muốn support query override folder:
    // const baseDir = req.query.dir;
    const data = await getOption1Summary();
    return res.status(200).json(data);
  } catch (err) {
    console.error("getOption1SummaryApi error:", err);
    return res.status(500).json({
      error: "Failed to get Option1 summary",
      details: String(err?.message || err),
    });
  }
}

export async function getOption1ModelComparisonController(req, res) {
  try {
    const baseDir =
      typeof req.query.baseDir === "string" && req.query.baseDir.trim()
        ? req.query.baseDir.trim()
        : undefined;

    const data = await getOption1ModelComparison(baseDir);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (err) {
    console.error("[OPTION1_MODEL_COMPARISON_ERROR]", err);
    return res.status(500).json({
      error: "OPTION1_MODEL_COMPARISON_FAILED",
      message: err?.message || "Unknown error",
    });
  }
}

export async function option1LanguageMatrixController(req, res) {
  try {
    const baseDir = req.query.baseDir;

    const data = await getOption1LanguageMatrix({
      baseDirOverride: baseDir,
    });

    return res.json(data);
  } catch (err) {
    console.error("[option1LanguageMatrixController]", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: String(err?.message || err),
    });
  }
}

export async function option1LatencyController(req, res) {
  try {
    const metric = req.query.metric || "top1";
    const baseDirOverride = req.query.baseDirOverride; // optional

    const data = await getOption1LatencySummary({ baseDirOverride, metric });
    return res.json(data);
  } catch (err) {
    console.error("[option1LatencyController]", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}

export async function option1TablesController(req, res) {
  try {
    // optional: allow override dir via query
    const baseDirOverride =
      typeof req.query?.baseDir === "string" && req.query.baseDir.trim()
        ? req.query.baseDir.trim()
        : undefined;

    const data = await getOption1TablesSummary({ baseDirOverride });

    res.status(200).json(data);
  } catch (err) {
    console.error("[option1TablesController]", err);
    res.status(500).json({
      error: "Failed to load Option1 tables summary",
      message: String(err?.message || err),
    });
  }
}