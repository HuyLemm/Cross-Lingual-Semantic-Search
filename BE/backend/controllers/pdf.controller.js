import fs from "fs";
import path from "path";
import {
  getPdfMeta,
  streamPdfToResponse,
  refreshDatasetIndex,
} from "../services/pdf.service.js";
import { processUploadedPdf } from "../services/pdfUpload.service.js";

export async function getDocMeta(req, res) {
  try {
    const { dataset = "articles_en", pdf, chunk_id } = req.query;

    if (!pdf) {
      return res.status(400).json({ error: "pdf is required" });
    }

    const meta = await getPdfMeta({ dataset, pdf, chunk_id });
    return res.json(meta);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Server error" });
  }
}

export async function getPdfStream(req, res) {
  try {
    const { dataset, pdf, download } = req.query;

    streamPdfToResponse(
      {
        dataset,
        pdf,
        download: download === "1" || download === "true",
      },
      req,
      res,
    );
  } catch (e) {
    console.error("PDF stream error:", e);

    res.status(e.status || 500).json({
      error: e.message || "Failed to stream PDF",
      debug: e.debug || null,
    });
  }
}

export async function refreshIndex(req, res) {
  try {
    const { dataset } = req.body || {};
    if (!dataset) {
      return res.status(400).json({ error: "dataset is required" });
    }

    refreshDatasetIndex(dataset);
    return res.json({ ok: true, dataset });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Server error" });
  }
}

export async function uploadPdfController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    const result = await processUploadedPdf(
      req.file.path,
      req.file.originalname,
    );

    let forwardedTo5000 = false;
    let pythonResponse = null;
    let forwardError = null;

    try {
      const pdfBuffer = fs.readFileSync(result.savedPath);

      const formData = new FormData();

      // Python expects request.files.getlist("files")
      formData.append(
        "files",
        new Blob([pdfBuffer], { type: "application/pdf" }),
        result.savedFilename,
      );

      // Python expects request.form.get("lang")
      const lang = result.detectedLanguage === "vietnamese" ? "vi" : "en";
      formData.append("lang", lang);

      const forwardRes = await fetch(
        "http://localhost:5000/api/permanent/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      try {
        pythonResponse = await forwardRes.json();
      } catch {
        pythonResponse = null;
      }

      if (!forwardRes.ok) {
        forwardError =
          pythonResponse?.error ||
          pythonResponse?.message ||
          `Python server returned HTTP ${forwardRes.status}`;
      } else {
        forwardedTo5000 = true;
      }
    } catch (err) {
      forwardError = err.message;
      console.error("Forward to localhost:5000 failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: forwardedTo5000
        ? "PDF uploaded, classified, and forwarded successfully"
        : "PDF uploaded and classified successfully, but forwarding to localhost:5000 failed",
      detectedLanguage: result.detectedLanguage,
      savedFilename: result.savedFilename,
      savedPath: result.savedPath,
      textLength: result.textLength,
      forwardedTo5000,
      pythonResponse,
      forwardError,
    });
  } catch (error) {
    console.error("uploadPdfController error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process uploaded PDF",
      error: error.message,
    });
  }
}

export async function removePdfController(req, res) {
  try {
    const { language, filename } = req.body || {};

    if (!language || !filename) {
      return res.status(400).json({
        success: false,
        message: "language and filename are required",
      });
    }

    const folder = language === "vietnamese" ? "articles_vi" : "articles_en";
    const filePath = path.join(
      process.cwd(),
      "data_articles",
      folder,
      filename,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "PDF removed successfully",
      filename,
    });
  } catch (error) {
    console.error("removePdfController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove PDF",
      error: error.message,
    });
  }
}
