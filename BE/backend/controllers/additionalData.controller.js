import { getIndexingChunkingBundle } from "../services/indexingChunking.service.js";

/**
 * GET /api/evaluation/indexing-chunking?baseDir=...
 */
export function getIndexingChunking(req, res) {
  const baseDir = typeof req.query.baseDir === "string" ? req.query.baseDir : undefined;

  const data = getIndexingChunkingBundle(baseDir);

  if (!data.ok) {
    return res.status(404).json(data);
  }

  return res.json(data);
}