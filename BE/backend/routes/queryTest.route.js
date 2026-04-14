import express from "express";
import { getQueryTestResults } from "../controllers/queryTest.controller.js";

const router = express.Router();

router.get("/query", getQueryTestResults);

export default router;