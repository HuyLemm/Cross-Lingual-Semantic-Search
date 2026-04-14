import fs from "fs";
import path from "path";

/**
 * Resolve base directory (tái sử dụng mọi nơi)
 */
export function resolveBaseDir(baseDirOverride) {
  const candidates = [
    baseDirOverride,
    process.env.OPTION1_EVAL_DIR,
    path.join(process.cwd(), "data_frontend"),
    path.join(process.cwd(), "backend", "data_frontend"),
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
    } catch {}
  }

  return path.join(process.cwd(), "data_frontend");
}

/**
 * Generic helper: get absolute file path inside baseDir
 * - filename: "results_usecase_dual.json", "results_querytype_benchmark.json", ...
 * - returns null if not found
 */
export function getFilePathInBaseDir(filename, baseDirOverride) {
  const baseDir = resolveBaseDir(baseDirOverride);
  const p = path.join(baseDir, filename);

  try {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  } catch {}

  return null;
}

/**
 * File cũ
 */
export function getResultsUsecaseDualPath(baseDirOverride) {
  return getFilePathInBaseDir("results_usecase_dual.json", baseDirOverride);
}

/**
 * File mới
 */
export function getResultsQuerytypeBenchmarkPath(baseDirOverride) {
  return getFilePathInBaseDir(
    "results_querytype_benchmark.json",
    baseDirOverride
  );
}