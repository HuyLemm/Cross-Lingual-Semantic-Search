import express from 'express';
import cors from 'cors';
import summaryRoutes from './routes/summary.routes.js';
import pdfRoutes from "./routes/pdf.routes.js";
import datasetRoutes from "./routes/dataset.routes.js";
import qaEvalRoutes from "./routes/qaEvaluation.routes.js";
import option1SummaryRoutes from "./routes/option1.routes.js";
import option2SummaryRoutes from "./routes/option2.routes.js";
import modelComparisonRoute from "./routes/modelComparison.route.js";
import queryTestRoute from "./routes/queryTest.route.js";
import additionalDataRoute from "./routes/additionalData.route.js";

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/summary', summaryRoutes);
app.use("/qa", pdfRoutes);
app.use("/dataset", datasetRoutes);
app.use("/qa-eval", qaEvalRoutes);
app.use("/evaluation", option1SummaryRoutes);
app.use("/evaluation", option2SummaryRoutes);
app.use("/model", modelComparisonRoute);
app.use("/query-test", queryTestRoute);
app.use("/add", additionalDataRoute);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
