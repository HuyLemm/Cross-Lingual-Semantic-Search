import { Router } from "express";
import { getIndexingChunking } from "../controllers/additionalData.controller.js";

const router = Router();

router.get("/indexing-chunking", getIndexingChunking);

export default router;