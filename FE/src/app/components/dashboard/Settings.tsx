import { useState } from 'react';
import SettingsHeader from './settings/SettingsHeader';
import EvaluationProtocolCard from './settings/EvaluationProtocolCard';
import HighlightDisplayCard from './settings/HighlightDisplayCard';
import ModelManagementCard from './settings/ModelManagementCard';
import DatasetManagementCard from './settings/DatasetManagementCard';
import MetricThresholdsCard from './settings/MetricThresholdsCard';
import ExportSettingsCard from './settings/ExportSettingsCard';
import AdvancedSettingsCard from './settings/AdvancedSettingsCard';
import SettingsActions from './settings/SettingsActions';
import { defaultModels, defaultDatasets } from './settings/settingsData';

export default function Settings() {
  const [highlightSensitivity, setHighlightSensitivity] = useState([75]);
  const [topKThreshold, setTopKThreshold] = useState([10]);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7]);
  const [models] = useState(defaultModels);
  const [datasets] = useState(defaultDatasets);

  return (
    <div className="space-y-6 p-6">
      <SettingsHeader />
      
      <EvaluationProtocolCard
        topKThreshold={topKThreshold}
        confidenceThreshold={confidenceThreshold}
        onTopKChange={setTopKThreshold}
        onConfidenceChange={setConfidenceThreshold}
      />
      
      <HighlightDisplayCard
        highlightSensitivity={highlightSensitivity}
        onHighlightChange={setHighlightSensitivity}
      />
      
      <ModelManagementCard models={models} />
      
      <DatasetManagementCard datasets={datasets} />
      
      <MetricThresholdsCard />
      
      <ExportSettingsCard />
      
      <AdvancedSettingsCard />
      
      <SettingsActions />
    </div>
  );
}
