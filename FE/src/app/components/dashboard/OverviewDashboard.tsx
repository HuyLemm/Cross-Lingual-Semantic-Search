import OverviewHeader from './overview/OverviewHeader';
import OverviewSummaryCards from './overview/OverviewSummaryCards';
import OverviewBestPerformers from './overview/OverviewBestPerformers';
import OverviewCharts from './overview/OverviewCharts';
import { topKAccuracyData, metricsOverTimeData, latencyAccuracyData, memoryUsageData } from './overview/overviewData';

export default function OverviewDashboard() {
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <OverviewSummaryCards />
      <OverviewBestPerformers />
      <OverviewCharts
        topKAccuracyData={topKAccuracyData}
        metricsOverTimeData={metricsOverTimeData}
        latencyAccuracyData={latencyAccuracyData}
        memoryUsageData={memoryUsageData}
      />
    </div>
  );
}