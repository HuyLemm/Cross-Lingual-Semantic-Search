import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { createReadStream } from "fs";

function resolveDatasetDir(language) {
  const baseDir = path.join(process.cwd(), "data_articles");
  const lang = String(language || "").toLowerCase();

  if (lang === "english" || lang === "en") return path.join(baseDir, "articles_en");
  if (lang === "vietnamese" || lang === "vi") return path.join(baseDir, "articles_vi");

  return path.join(baseDir, "articles_en");
}

async function walkDirRecursive(dir) {
  let results = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await walkDirRecursive(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function toPosixRelative(rootDir, fullPath) {
  const rel = path.relative(rootDir, fullPath);
  return rel.split(path.sep).join("/");
}

export async function listPdfFiles(language) {
  const datasetDir = resolveDatasetDir(language);

  if (!fs.existsSync(datasetDir)) {
    return { language: language || "english", datasetDir, count: 0, files: [] };
  }

  const allPaths = await walkDirRecursive(datasetDir);

  const pdfPaths = allPaths
    .filter((p) => p.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b));

  const files = await Promise.all(
    pdfPaths.map(async (fullPath) => {
      const st = await fsp.stat(fullPath);
      return {
        name: path.basename(fullPath),
        relativePath: toPosixRelative(datasetDir, fullPath),
        sizeBytes: st.size,
        updatedAt: st.mtime.toISOString(),
      };
    })
  );

  return {
    language: language || "english",
    datasetDir,
    count: files.length,
    files,
  };
}

export async function getPdfStats() {
  const [en, vi] = await Promise.all([listPdfFiles("english"), listPdfFiles("vietnamese")]);

  const sumBytes = (arr) => arr.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

  return {
    totalDocs: en.count + vi.count,
    englishDocs: en.count,
    vietnameseDocs: vi.count,
    totalBytes: sumBytes(en.files) + sumBytes(vi.files),
  };
}

function sanitizeRelativePdfPath(relativePath) {
  const p = String(relativePath || "").trim();

  if (!p) throw new Error("Missing path");
  if (p.includes("\0")) throw new Error("Invalid path");

  // Decode URI if user passed encoded path
  let decoded = p;
  try {
    decoded = decodeURIComponent(p);
  } catch {
    // keep original if decode fails
  }

  // Use posix-style normalization for URL-ish paths
  const normalized = decoded.replaceAll("\\", "/");

  // Must be pdf
  if (!normalized.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only .pdf files are allowed");
  }

  // Disallow absolute paths
  if (normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized)) {
    throw new Error("Absolute paths are not allowed");
  }

  // Resolve and ensure it doesn't escape root by checking for ".." segments after normalize
  const safe = path.posix.normalize(normalized);
  if (safe.startsWith("..") || safe.includes("/../")) {
    throw new Error("Path traversal detected");
  }

  return safe;
}

export async function resolvePdfAbsolutePath(language, relativePath) {
  const datasetDir = resolveDatasetDir(language);

  const safeRel = sanitizeRelativePdfPath(relativePath);

  const absPath = path.join(datasetDir, ...safeRel.split("/"));

  const relToRoot = path.relative(datasetDir, absPath);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
    throw new Error("Path escapes dataset root");
  }

  // Exists?
  await fsp.access(absPath);

  return { datasetDir, absPath, safeRel };
}

export async function getPdfStreamPayload(language, relativePath, mode = "inline") {
  const { absPath, safeRel } = await resolvePdfAbsolutePath(language, relativePath);

  const stat = await fsp.stat(absPath);

  const fileName = path.basename(safeRel);

  return {
    fileName,
    sizeBytes: stat.size,
    stream: createReadStream(absPath),
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(stat.size),
      "Content-Disposition":
        mode === "attachment"
          ? `attachment; filename="${encodeURIComponent(fileName)}"`
          : `inline; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "no-store",
    },
  };
}