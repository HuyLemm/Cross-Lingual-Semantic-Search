import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

function resolveDataDir() {
  const cwd = process.cwd();

  const candidates = [
    path.join(cwd, "data_articles"), // if running inside backend/
    path.join(cwd, "backend", "data_articles"), // if running from repo root
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
    } catch {}
  }

  const err = new Error(
    `DATA_DIR not found. Tried:\n- ${candidates.join("\n- ")}\nCurrent cwd: ${cwd}`,
  );
  err.status = 500;
  throw err;
}

const DATA_DIR = resolveDataDir();
const DATASET_INDEX_CACHE = new Map();

function sanitizeDataset(dataset) {
  const d = String(dataset || "").trim();
  if (!d) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(d)) return null;
  return d;
}

/** decode an toàn */
function safeDecodeURIComponent(v) {
  try {
    return decodeURIComponent(v);
  } catch {
    return String(v || "");
  }
}

function normalizeTitle(title) {
  if (!title) return "";

  let t = String(title).normalize("NFC");

  t = t.toLowerCase();
  t = t.replace(/:/g, "");
  t = t.replace(/-/g, " ");
  t = t.replace(/_/g, " ");
  t = t.replace(/[^\p{L}\p{N}\s]/gu, "");
  t = t.replace(/\s+/g, " ");

  return t.trim();
}

function isPdfFilename(name) {
  return typeof name === "string" && name.toLowerCase().endsWith(".pdf");
}

function ensurePdfExtension(name) {
  if (!name) return "";
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
}

function buildDatasetIndex(dataset) {
  const folderPath = path.join(DATA_DIR, dataset);

  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    const err = new Error(`Dataset folder not found: ${dataset}`);
    err.status = 404;
    err.debug = { DATA_DIR, folderPath };
    throw err;
  }

  const files = fs.readdirSync(folderPath).filter((f) => isPdfFilename(f));

  const index = new Map();
  for (const file of files) {
    const nameWithoutExt = file.replace(/\.pdf$/i, "");
    const key = normalizeTitle(nameWithoutExt);
    if (key && !index.has(key)) {
      index.set(key, file);
    }
  }

  const payload = { folderPath, index, builtAt: Date.now() };
  DATASET_INDEX_CACHE.set(dataset, payload);
  return payload;
}

/** Get cached dataset index; build if missing. */
function getDatasetIndex(dataset) {
  const cached = DATASET_INDEX_CACHE.get(dataset);
  if (cached) return cached;
  return buildDatasetIndex(dataset);
}

function assertResolvedInsideDataDir(filePath) {
  const resolved = path.resolve(filePath);
  const resolvedBase = path.resolve(DATA_DIR);

  if (!resolved.startsWith(resolvedBase)) {
    const err = new Error("Invalid path");
    err.status = 400;
    err.debug = { resolved, resolvedBase };
    throw err;
  }

  return resolved;
}

function tryDirectFileMatch(folderPath, raw) {
  const base = path.basename(raw || "").trim();
  if (!base) return null;

  const directCandidates = [
    base,
    ensurePdfExtension(base),
  ];

  for (const candidate of directCandidates) {
    const fullPath = path.join(folderPath, candidate);
    const resolved = assertResolvedInsideDataDir(fullPath);

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return resolved;
    }
  }

  return null;
}

export function resolvePdfPath({ dataset, pdf }) {
  const safeDataset = sanitizeDataset(dataset);
  if (!safeDataset) {
    const err = new Error("Invalid dataset");
    err.status = 400;
    throw err;
  }

  const raw = safeDecodeURIComponent(pdf || "").trim();
  if (!raw) {
    const err = new Error("Invalid pdf");
    err.status = 400;
    throw err;
  }

  const { folderPath, index } = getDatasetIndex(safeDataset);

  // 1) Ưu tiên tìm đúng tên file trước
  const directMatch = tryDirectFileMatch(folderPath, raw);
  if (directMatch) {
    return directMatch;
  }

  // 2) Không có thì mới normalize để match mềm
  const base = path.basename(raw);
  const titleWithoutExt = base.replace(/\.pdf$/i, "");
  const key = normalizeTitle(titleWithoutExt);

  const filename = index.get(key);

  if (!filename) {
    const err = new Error("PDF not found");
    err.status = 404;
    err.debug = {
      dataset: safeDataset,
      raw,
      base,
      key,
      folderPath,
      triedDirect: true,
      fallbackNormalized: true,
    };
    throw err;
  }

  const filePath = path.join(folderPath, filename);
  const resolved = assertResolvedInsideDataDir(filePath);

  if (!fs.existsSync(resolved)) {
    const err = new Error("PDF not found on disk");
    err.status = 404;
    err.debug = { resolved, filename, folderPath };
    throw err;
  }

  return resolved;
}

/**
 * Return simple metadata for PDF
 */
export async function getPdfMeta({ dataset, pdf, chunk_id }) {
  const filePath = resolvePdfPath({ dataset, pdf });
  const stat = fs.statSync(filePath);
  const filename = path.basename(filePath);

  let pages = null;
  try {
    const bytes = fs.readFileSync(filePath);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pages = doc.getPageCount();
  } catch (e) {
    pages = null;
  }

  return {
    dataset,
    pdfName: filename,
    sizeBytes: stat.size,
    pages,
    pageNumber: null,
    chunk_id: chunk_id ? String(chunk_id) : null,
    pdfUrl: `/qa/pdf?dataset=${encodeURIComponent(dataset)}&pdf=${encodeURIComponent(filename)}`,
    downloadUrl: `/qa/pdf?dataset=${encodeURIComponent(dataset)}&pdf=${encodeURIComponent(filename)}&download=1`,
  };
}

/**
 * Stream PDF to client
 */
export function streamPdfToResponse({ dataset, pdf, download }, req, res) {
  const filePath = resolvePdfPath({ dataset, pdf });
  const filename = path.basename(filePath);

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );

  const range = req?.headers?.range;
  if (range) {
    const match = String(range).match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
        return res.end();
      }

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", end - start + 1);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on("error", (e) => {
        console.error("PDF range stream error:", e);
        res.status(500).end("Failed to stream pdf");
      });
      return stream.pipe(res);
    }
  }

  res.setHeader("Content-Length", fileSize);

  const stream = fs.createReadStream(filePath);
  stream.on("error", (e) => {
    console.error("PDF stream error:", e);
    res.status(500).end("Failed to stream pdf");
  });

  return stream.pipe(res);
}

export function refreshDatasetIndex(dataset) {
  const safeDataset = sanitizeDataset(dataset);
  if (!safeDataset) {
    const err = new Error("Invalid dataset");
    err.status = 400;
    throw err;
  }
  buildDatasetIndex(safeDataset);
  return true;
}

export function _debugNormalizeTitle(s) {
  return normalizeTitle(s);
}

export function _debugDataDir() {
  return DATA_DIR;
}