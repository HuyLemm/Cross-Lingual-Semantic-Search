import ErrorSummaryCards from './error-analysis/ErrorSummaryCards';
import ErrorCategoriesTable from './error-analysis/ErrorCategoriesTable';
import ErrorByModelChart from './error-analysis/ErrorByModelChart';
import ConfusionMatrix from './error-analysis/ConfusionMatrix';
import ErrorExamplesPanel from './error-analysis/ErrorExamplesPanel';
import ErrorInsights from './error-analysis/ErrorInsights';
import { errorCategories, errorByModelData, errorExamples } from './error-analysis/errorAnalysisData';

export default function ErrorAnalysis() {
  return (
    <div className="space-y-6">
      <ErrorSummaryCards />
      <ErrorCategoriesTable categories={errorCategories} />
      <ErrorByModelChart data={errorByModelData} />
      <ConfusionMatrix />
      <ErrorExamplesPanel examples={errorExamples} />
      <ErrorInsights />
    </div>
  );
}
