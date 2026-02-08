import express from 'express';
import {
  getSummary,
  getQAList,
  getExperiments,
  getDatasetOverview
} from '../controllers/summary.controller.js';

const router = express.Router();

router.get('/get-summary', getSummary);
router.get('/list', getQAList);
router.get('/experiments', getExperiments);
router.get('/dataset-overview', getDatasetOverview);


export default router;
