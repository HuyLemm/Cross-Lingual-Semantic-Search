import express from 'express';
import cors from 'cors';
import summaryRoutes from './routes/summary.routes.js';
import datasetEvalRoutes from './routes/datasetEval.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/summary', summaryRoutes);
app.use('/dataset-eval', datasetEvalRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
