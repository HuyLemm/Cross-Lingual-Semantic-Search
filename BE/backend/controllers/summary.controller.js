import {
  buildSummary,
  buildQAList,
  buildDatasetOverview
} from '../services/summary.service.js';

import { getExperimentsByModel } from '../utils/utils.js';


export function getSummary(req, res) {
  try {
    const data = buildSummary(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export function getQAList(req, res) {
  try {
    const data = buildQAList(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}


export function getExperiments(req, res) {
  try {
    const { model = 'all' } = req.query;
    const exps = getExperimentsByModel(model);
    res.json(exps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getDatasetOverview(req, res) {
  try {
    const data = buildDatasetOverview();  
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

