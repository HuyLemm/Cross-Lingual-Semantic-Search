import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search } from "lucide-react";

interface DatasetGroundTruthHeaderProps {
  selectedDataset: string;
  selectedModel: string;
  selectedExperiment: string;
  selectedQuality: string;
  searchQuery: string;
  availableExperiments: string[];
  shouldShowExpList: boolean;
  onDatasetChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onExperimentChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function DatasetGroundTruthHeader({
  selectedDataset,
  selectedModel,
  selectedExperiment,
  selectedQuality,
  searchQuery,
  availableExperiments,
  shouldShowExpList,
  onDatasetChange,
  onModelChange,
  onExperimentChange,
  onQualityChange,
  onSearchChange,
}: DatasetGroundTruthHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Dataset Management & QA Validation
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          End-to-end QA generation, normalization, and semantic verification
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Dataset Source */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            Dataset Source
          </label>
          <Select value={selectedDataset} onValueChange={onDatasetChange}>
            <SelectTrigger className="w-[260px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Datasets</SelectItem>
              <SelectItem value="vjol">VJOL – Vietnamese</SelectItem>
              <SelectItem value="semantic_scholar">
                Semantic Scholar – English
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            Model
          </label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-[220px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt">GPT-5.2</SelectItem>
              <SelectItem value="gemini">Gemini-2.5-Flash</SelectItem>
              <SelectItem value="deepseek">DeepSeek-R1T2-Chimera</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experiment */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            Experiment
          </label>
          <Select value={selectedExperiment} onValueChange={onExperimentChange}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="max-h-[180px] overflow-y-auto">
              <SelectItem value="all">All Exps</SelectItem>

              {availableExperiments.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Threshold */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            Quality
          </label>
          <Select value={selectedQuality} onValueChange={onQualityChange}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.7">≥ 0.70</SelectItem>
              <SelectItem value="0.75">≥ 0.75</SelectItem>
              <SelectItem value="0.8">≥ 0.80</SelectItem>
              <SelectItem value="0.85">≥ 0.85</SelectItem>
              <SelectItem value="0.9">≥ 0.90</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 ml-auto">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search QA, title, or source PDF..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[260px] h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
