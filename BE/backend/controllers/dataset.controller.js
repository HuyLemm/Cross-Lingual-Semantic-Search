import { listPdfFiles, getPdfStats } from "../services/dataset.service.js";

export async function listPdfs(req, res) {
  try {
    const language = req.query.language || req.query.lang || "english";
    const data = await listPdfFiles(language);
    return res.status(200).json(data);
  } catch (err) {
    console.error("listPdfs error:", err);
    return res.status(500).json({ error: "Failed to list PDF files", details: String(err?.message || err) });
  }
}

export async function getDatasetStats(req, res) {
  try {
    const stats = await getPdfStats();
    return res.status(200).json(stats);
  } catch (err) {
    console.error("getDatasetStats error:", err);
    return res.status(500).json({ error: "Failed to get dataset stats", details: String(err?.message || err) });
  }
}

// ✅ View inline (browser)
export async function viewPdf(req, res) {
  try {
    const language = req.query.language || "english";
    const relPath = req.query.path; // relativePath from listPdfFiles()

    const payload = await getPdfStreamPayload(language, relPath, "inline");
    for (const [k, v] of Object.entries(payload.headers)) res.setHeader(k, v);

    payload.stream.on("error", (e) => {
      console.error("stream error:", e);
      if (!res.headersSent) res.status(500).end("Stream error");
      else res.end();
    });

    return payload.stream.pipe(res);
  } catch (err) {
    console.error("viewPdf error:", err);
    return res.status(400).json({ error: "Failed to open PDF", details: String(err?.message || err) });
  }
}

// ✅ Download attachment
export async function downloadPdf(req, res) {
  try {
    const language = req.query.language || "english";
    const relPath = req.query.path;

    const payload = await getPdfStreamPayload(language, relPath, "attachment");
    for (const [k, v] of Object.entries(payload.headers)) res.setHeader(k, v);

    payload.stream.on("error", (e) => {
      console.error("stream error:", e);
      if (!res.headersSent) res.status(500).end("Stream error");
      else res.end();
    });

    return payload.stream.pipe(res);
  } catch (err) {
    console.error("downloadPdf error:", err);
    return res.status(400).json({ error: "Failed to download PDF", details: String(err?.message || err) });
  }
}