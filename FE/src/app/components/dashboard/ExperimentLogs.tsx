import { useState } from 'react';
import ExperimentLogsHeader from './experiment-logs/ExperimentLogsHeader';
import ExperimentLogsSummary from './experiment-logs/ExperimentLogsSummary';
import ExperimentLogsTable from './experiment-logs/ExperimentLogsTable';
import TopExperimentsComparison from './experiment-logs/TopExperimentsComparison';
import ExperimentNotes from './experiment-logs/ExperimentNotes';
import { mockExperiments } from './experiment-logs/experimentLogsData';

export default function ExperimentLogs() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (runId: string) => {
    setExpandedRow(expandedRow === runId ? null : runId);
  };

  return (
    <div className="space-y-6 p-6">
      <ExperimentLogsHeader />
      <ExperimentLogsSummary experiments={mockExperiments} />
      <ExperimentLogsTable 
        experiments={mockExperiments}
        expandedRow={expandedRow}
        onToggleExpand={toggleExpand}
      />
      <TopExperimentsComparison experiments={mockExperiments} />
      <ExperimentNotes />
    </div>
  );
}
