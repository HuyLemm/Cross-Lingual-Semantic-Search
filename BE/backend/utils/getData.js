import fs from "fs";
import path from "path";

/* ============================= */
/*           IO / PARSE          */
/* ============================= */

export function safeReadText(filePath) {
  return fs.readFileSync(filePath, { encoding: "utf-8" });
}

export function parseNumberAfterLabel(text, labelRegex) {
  const m = text.match(labelRegex);
  if (!m) return null;
  const raw = (m[1] || "").trim();
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

export function parseDatasetTotal(text) {
  const v = parseNumberAfterLabel(text, /Total items in dataset\s*:\s*(\d+)/i);
  return v ?? 0;
}

export function parseAccuracyTotal(text, k /* 1|3|5|10 */) {
  const blockRe = new RegExp(
    `Top-${k}:([\\s\\S]*?)(?:\\n\\s*Top-|\\n\\s*Latency\\s*\\(ms\\):|\\n\\s*Runtime\\s*:|$)`,
    "i",
  );
  const block = (text.match(blockRe) || [null, ""])[1] || "";
  return parseNumberAfterLabel(block, /accuracy_total\s*:\s*([0-9.]+)/i);
}

export function parseLatency(text) {
  const avg = parseNumberAfterLabel(
    text,
    /Latency\s*\(ms\):[\s\S]*?\n\s*Avg\s*:\s*([0-9.]+)/i,
  );
  return { avgMs: avg ?? 0 };
}

/* ============================= */
/*        META FROM FILENAME     */
/* ============================= */

export function inferMetaFromFilename(filename) {
  const base = filename.toLowerCase();

  const model = base.startsWith("deep_")
    ? "DeepSeek"
    : base.startsWith("gem_")
      ? "Gemini"
      : base.startsWith("gpt_")
        ? "GPT"
        : null;
  if (!model) return null;

  const language = base.includes("_eng")
    ? "EN"
    : base.includes("_vi")
      ? "VI"
      : null;
  if (!language) return null;

  // ✅ threshold label (ưu tiên baseline nếu có)
  const threshold = base.includes("baseline")
    ? "Baseline"
    : base.includes("_0.7")
      ? "0.7"
      : base.includes("_0.8")
        ? "0.8"
        : "All QAs";

  return { model, language, threshold };
}

export function makeId(meta) {
  return `${meta.model}_${meta.language}_${meta.threshold}`;
}

export function formatConfigLabel(c) {
  return `${c.model} ${c.language} ${c.threshold}`;
}

/* ============================= */
/*        STATS / REDUCTION      */
/* ============================= */

export function pickBestBy(configs, getVal, mode /* "max"|"min" */) {
  let best = null;
  let bestVal = null;

  for (const c of configs) {
    const v = getVal(c);
    if (v == null || !Number.isFinite(v)) continue;

    if (best == null || bestVal == null) {
      best = c;
      bestVal = v;
      continue;
    }

    if (mode === "max" && v > bestVal) {
      best = c;
      bestVal = v;
    }
    if (mode === "min" && v < bestVal) {
      best = c;
      bestVal = v;
    }
  }

  return { best, bestVal };
}

export function avg(nums) {
  const arr = (nums || []).filter((x) => Number.isFinite(x));
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function safeNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/* ============================= */
/*        DIR RESOLUTION         */
/* ============================= */

export function resolveBaseDirLLM(baseDirOverride) {
  const candidates = [];
  if (baseDirOverride) candidates.push(baseDirOverride);
  if (process.env.OPTION1_EVAL_DIR) candidates.push(process.env.OPTION1_EVAL_DIR);

  // ✅ Prefer normalized
  candidates.push(path.join(process.cwd(), "data_frontend", "LLM_normalized"));
  candidates.push(path.join(process.cwd(), "backend", "data_frontend", "LLM_normalized"));

  // ✅ Fallback raw
  candidates.push(path.join(process.cwd(), "data_frontend", "LLM"));
  candidates.push(path.join(process.cwd(), "backend", "data_frontend", "LLM"));

  for (const dir of candidates) {
    try {
      if (dir && fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
    } catch {}
  }

  return candidates[0] || path.join(process.cwd(), "backend", "data_frontend", "LLM");
}

export function resolveBaseDirBGE(baseDirOverride) {
  const candidates = [];
  if (baseDirOverride) candidates.push(baseDirOverride);
  if (process.env.OPTION1_EVAL_DIR) candidates.push(process.env.OPTION1_EVAL_DIR);

  // ✅ Prefer normalized
  candidates.push(path.join(process.cwd(), "data_frontend", "BGE_normalized"));
  candidates.push(path.join(process.cwd(), "backend", "data_frontend", "BGE_normalized"));

  // ✅ Fallback raw
  candidates.push(path.join(process.cwd(), "data_frontend", "BGE"));
  candidates.push(path.join(process.cwd(), "backend", "data_frontend", "BGE"));

  for (const dir of candidates) {
    try {
      if (dir && fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
    } catch {}
  }

  return candidates[0] || path.join(process.cwd(), "backend", "data_frontend", "BGE");
}
