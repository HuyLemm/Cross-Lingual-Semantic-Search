import fs from "fs";
import path from "path";

export function resolveBaseDir(baseDirOverride) {
  const candidates = [
    baseDirOverride,
    path.join(process.cwd(), "data_frontend"),
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
    } catch {}
  }

  return path.join(process.cwd(), "data_frontend");
}

/**
 * Get absolute path of model_comparison.txt in baseDir
 */
export function getModelComparisonTxtPath(baseDirOverride) {
  const baseDir = resolveBaseDir(baseDirOverride);
  const p = path.join(baseDir, "model_comparison.txt");

  try {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  } catch {}

  return null;
}

/**
 * Read model_comparison.txt content (utf8)
 * Throw error if not found.
 */
export function readModelComparisonTxt(baseDirOverride) {
  const filePath = getModelComparisonTxtPath(baseDirOverride);
  if (!filePath) {
    const baseDir = resolveBaseDir(baseDirOverride);
    throw new Error(`model_comparison.txt not found under: ${baseDir}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Extract a [TABLE N] block into array of lines (raw lines, giữ nguyên tab)
 */
export function extractTableBlock(text, tableIndex) {
  const lines = String(text || "").split(/\r?\n/);
  const tag = `[TABLE ${tableIndex}]`;

  const start = lines.findIndex((l) => l.trim() === tag);
  if (start < 0) return [];

  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^\[TABLE\s+\d+\]$/.test(t)) break;
    out.push(lines[i]);
  }
  return out;
}

/**
 * Basic number parsing helper
 */
export function toNum(x) {
  const n = Number(String(x ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}