// services/modelComparison-rawTable.service.js
import { readModelComparisonTxt, extractTableBlock, toNum } from "../utils/getDataFromTxt.js";

/* =============================
   Parse PARAGRAPHS: map TABLE 1..6 -> { dataset, tau }
============================= */
function parseParagraphConfigs(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim());

  const idx = lines.findIndex((l) => l === "[PARAGRAPHS]");
  if (idx < 0) return [];

  const configs = [];

  for (let i = idx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (l === "[TABLES]") break;

    // Accept:
    // "DeepSeek Dataset (τ = 0.7)"
    // "3. Gemini Dataset (τ = 0.7)"
    // "5. GPT Dataset (τ = 0.7)"
    const m = l.match(/(DeepSeek|Gemini|GPT).*?\(\s*τ\s*=\s*([0-9.]+)\s*\)/i);
    if (!m) continue;

    const datasetRaw = m[1].toLowerCase();
    let dataset = null;

    if (datasetRaw === "deepseek") dataset = "DeepSeek";
    else if (datasetRaw === "gemini") dataset = "Gemini";
    else if (datasetRaw === "gpt") dataset = "GPT";

    const tau = toNum(m[2]);

    if (dataset && Number.isFinite(tau)) {
      configs.push({ dataset, tau });
    }
  }

  return configs; // [0]..[5] => TABLE 1..6
}

/* =============================
   Parse TSV rows in TABLE 1..6
============================= */
function parseTsvTable(tableLines) {
  const clean = (tableLines || []).map((l) => l.trim()).filter(Boolean);
  if (clean.length < 2) return [];

  const rows = [];

  for (let i = 1; i < clean.length; i++) {
    const parts = clean[i].split("\t").map((s) => s.trim());
    if (parts.length < 7) continue;

    const [model, language, sizeStr, top1Str, top3Str, top5Str, top10Str] = parts;

    if (!(language === "EN" || language === "VI")) continue;

    const datasetSize = toNum(sizeStr);
    const top1 = toNum(top1Str);
    const top3 = toNum(top3Str);
    const top5 = toNum(top5Str);
    const top10 = toNum(top10Str);

    if (
      !model ||
      !Number.isFinite(datasetSize) ||
      ![top1, top3, top5, top10].every(Number.isFinite)
    ) {
      continue;
    }

    rows.push({
      model,
      language,
      datasetSize,
      top1,
      top3,
      top5,
      top10,
    });
  }

  return rows;
}

/* =============================
   Public loader: merged rows + options
   rows: { dataset, tau, model, language, datasetSize, top1, top3, top5, top10 }
============================= */
export function loadModelComparisonRawTable(baseDirOverride) {
  const text = readModelComparisonTxt(baseDirOverride);
  const configs = parseParagraphConfigs(text);

  const rows = [];

  // 6 table đầu là raw comparison tables:
  // 1-2 = DeepSeek, 3-4 = Gemini, 5-6 = GPT
  for (let t = 1; t <= 6; t++) {
    const cfg = configs[t - 1];
    const tableLines = extractTableBlock(text, t);
    const parsed = parseTsvTable(tableLines);

    for (const r of parsed) {
      rows.push({
        dataset: cfg?.dataset ?? `TABLE_${t}`,
        tau: Number.isFinite(cfg?.tau) ? cfg.tau : null,
        model: r.model,
        language: r.language,
        datasetSize: r.datasetSize,
        top1: r.top1,
        top3: r.top3,
        top5: r.top5,
        top10: r.top10,
      });
    }
  }

  const options = {
    datasets: [...new Set(rows.map((r) => r.dataset))].sort(),
    taus: [...new Set(rows.map((r) => r.tau).filter((x) => x != null))].sort((a, b) => a - b),
    languages: ["ALL", "EN", "VI"],
    models: [...new Set(rows.map((r) => r.model))].sort(),
  };

  return { ok: true, rows, options };
}