import { Card, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface DatasetEvaluationHeaderProps {
  language: string;
  selectedModel: string;
  verification: string;
  onLanguageChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onVerificationChange: (value: string) => void;
}

export default function DatasetEvaluationHeader({
  language,
  selectedModel,
  verification,
  onLanguageChange,
  onModelChange,
  onVerificationChange,
}: DatasetEvaluationHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          QA Dataset Quality Evaluation
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyze quality, verification reliability, and distribution of generated QA dataset
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4">

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Language:
              </label>
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="VI">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Model:
              </label>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="w-[200px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="gpt">GPT-5.2</SelectItem>
                  <SelectItem value="gemini">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="deepseek">DeepSeek R1T2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verification Filter */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Verified By:
              </label>
              <Select value={verification} onValueChange={onVerificationChange}>
                <SelectTrigger className="w-[180px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="bi">Bi-Encoder</SelectItem>
                  <SelectItem value="cross">Cross-Encoder</SelectItem>
                  <SelectItem value="both">Bi + Cross (Final)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
