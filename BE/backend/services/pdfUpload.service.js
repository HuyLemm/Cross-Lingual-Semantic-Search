import fs from "fs";
import path from "path";
import { franc } from "franc";

// Import worker/config trước
import { getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getData());

function sanitizeFilename(filename) {
  return filename
    .normalize("NFC")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function extractPdfText(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    // cleanup nếu package có destroy
    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }

    return (result?.text || "").trim();
  } catch (err) {
    console.error("PDF extract error:", err.message);
    return "";
  }
}

function countVietnameseChars(text) {
  const viRegex =
    /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/gi;

  const matches = text.match(viRegex);
  return matches ? matches.length : 0;
}

function detectLanguageFromText(text) {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();

  if (!normalized || normalized.length < 30) {
    return "unknown";
  }

  const viCount = countVietnameseChars(normalized);

  if (viCount >= 8) {
    return "vietnamese";
  }

  const sample = normalized.slice(0, 4000);
  const lang = franc(sample);

  if (lang === "vie") return "vietnamese";
  if (lang === "eng") return "english";

  return "unknown";
}

function buildTargetFilename(originalName, targetDir) {
  const cleaned = sanitizeFilename(originalName);
  const ext = path.extname(cleaned);
  const base = path.basename(cleaned, ext);

  let candidate = cleaned;
  let counter = 1;

  while (fs.existsSync(path.join(targetDir, candidate))) {
    candidate = `${base}_${counter}${ext}`;
    counter += 1;
  }

  return candidate;
}

export async function processUploadedPdf(tempFilePath, originalName) {
  const backendRoot = process.cwd();

  const articlesEnDir = path.join(backendRoot, "data_articles", "articles_en");
  const articlesViDir = path.join(backendRoot, "data_articles", "articles_vi");
  const unknownDir = path.join(backendRoot, "data_articles", "articles_unknown");

  ensureDir(articlesEnDir);
  ensureDir(articlesViDir);
  ensureDir(unknownDir);

  const extractedText = await extractPdfText(tempFilePath);
  const detectedLanguage = detectLanguageFromText(extractedText);

  let targetDir;
  if (detectedLanguage === "vietnamese") {
    targetDir = articlesViDir;
  } else if (detectedLanguage === "english") {
    targetDir = articlesEnDir;
  } else {
    targetDir = unknownDir;
  }

  const targetFilename = buildTargetFilename(originalName, targetDir);
  const targetPath = path.join(targetDir, targetFilename);

  fs.renameSync(tempFilePath, targetPath);

  return {
    success: true,
    detectedLanguage,
    savedFilename: targetFilename,
    savedPath: targetPath,
    textLength: extractedText.length,
  };
}