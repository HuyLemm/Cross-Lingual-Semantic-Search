import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { getDocMeta, getPdfStream, refreshIndex, uploadPdfController, removePdfController } from "../controllers/pdf.controller.js";

const router = express.Router();

router.get("/doc-meta", getDocMeta);
router.get("/pdf", getPdfStream);

// optional
router.post("/refresh-index", refreshIndex);

router.delete("/remove", removePdfController);


const tempUploadDir = path.join(process.cwd(), "temp_uploads");
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

router.post("/upload", upload.single("file"), uploadPdfController);


export default router;