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

export function getFilePathInBaseDir(filename, baseDirOverride) {
  const baseDir = resolveBaseDir(baseDirOverride);
  const p = path.join(baseDir, filename);

  try {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  } catch {}

  return null;
}

/**
 * Convenience wrappers for your files
 */
export function getExperimentMetricsLLMPath(baseDirOverride) {
  return getFilePathInBaseDir("experiment_metrics_LLM.json", baseDirOverride);
}
export function getExperimentMetricsBGEPath(baseDirOverride) {
  return getFilePathInBaseDir("experiment_metrics_BGE.json", baseDirOverride);
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Normalize raw JSON -> đúng format FE đang dùng (thay mock được ngay)
 */
function normalizeMetrics(raw) {
  const indexingRows = raw?.indexing_strategy?.rows ?? [];
  const chunkingRows = raw?.chunking_strategy?.rows ?? [];

  const indexingStrategies = indexingRows.map((r) => ({
    name: r.strategy,
    buildTime: r.build_time_s,
    queryLatency: r.query_latency_ms,
    recall: r.recall_at_10 ?? null,
    memory: typeof r.memory_gb === "number" ? r.memory_gb : null,
    bestFor: r.best_for ?? "",
  }));

  const chunkingStrategies = chunkingRows.map((r) => ({
    name: r.strategy,
    avgChunks: r.avg_chunks,
    recall: r.recall_at_10 ?? null,
    overlap: r.overlap_ratio,
    coherence: r.coherence_score ?? null,
    notes: r.notes ?? "",
  }));

  // Chart data giống mock (derive từ indexingStrategies)
  const buildTimeComparisonData = indexingStrategies.map((s) => ({
    strategy: String(s.name).split(" ")[0],
    time: s.buildTime,
  }));

  const queryLatencyComparisonData = indexingStrategies.map((s) => ({
    strategy: String(s.name).split(" ")[0],
    latency: s.queryLatency,
  }));

  return {
    raw, // giữ raw cho FE muốn dùng sâu hơn

    // drop-in replacement cho mock
    indexingStrategies,
    chunkingStrategies,
    buildTimeComparisonData,
    queryLatencyComparisonData,

    // selected (nếu muốn bind header select)
    selectedIndexing: raw?.indexing_strategy?.selected ?? null,
    selectedChunking: raw?.chunking_strategy?.selected ?? null,

    meta: raw?.meta ?? null,
    vector_database: raw?.vector_database ?? null,
  };
}

/**
 * Main service function
 */
export function getIndexingChunkingBundle(baseDirOverride) {
  const llmPath = getExperimentMetricsLLMPath(baseDirOverride);
  const bgePath = getExperimentMetricsBGEPath(baseDirOverride);

  if (!llmPath || !bgePath) {
    return {
      ok: false,
      error: "Missing metrics file(s)",
      resolvedBaseDir: resolveBaseDir(baseDirOverride),
      files: {
        experiment_metrics_LLM: llmPath,
        experiment_metrics_BGE: bgePath,
      },
    };
  }

  const llmRaw = readJsonFile(llmPath);
  const bgeRaw = readJsonFile(bgePath);

  return {
    ok: true,
    resolvedBaseDir: resolveBaseDir(baseDirOverride),
    files: {
      experiment_metrics_LLM: llmPath,
      experiment_metrics_BGE: bgePath,
    },
    models: {
      LLM: normalizeMetrics(llmRaw),
      BGE: normalizeMetrics(bgeRaw),
    },
  };
}