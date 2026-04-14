// app/(whatever)/backend/routes/qaEvaluation.routes.js

import express from "express";
import { getModelSection } from "../controllers/qaEvaluation.controller.js";
import { getCrossModelComparison } from "../controllers/crossModelComparison.controller.js";

const router = express.Router();

// ModelSection payload for dashboard charts
router.get("/model-section", getModelSection);
router.get("/cross-model", getCrossModelComparison);

export default router;