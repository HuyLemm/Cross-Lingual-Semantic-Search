// backend/routes/pdf.routes.js
import express from "express";
import { listPdfs, getDatasetStats, viewPdf, downloadPdf } from "../controllers/dataset.controller.js";

const router = express.Router();

// GET /api/pdfs?language=english
// GET /api/pdfs?language=vietnamese
router.get("/list", listPdfs);

// GET /api/pdfs/stats
router.get("/stats", getDatasetStats);

// view / download
router.get("/view", viewPdf);         // /api/pdfs/view?language=english&path=sub/a.pdf
router.get("/download", downloadPdf); // /api/pdfs/download?language=english&path=sub/a.pdf

export default router;