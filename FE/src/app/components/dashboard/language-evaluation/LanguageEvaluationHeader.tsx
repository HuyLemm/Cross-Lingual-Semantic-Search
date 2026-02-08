import { Card, CardContent } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface LanguageEvaluationHeaderProps {
  sourceLanguage: string;
  targetLanguage: string;
  selectedModel: string;
  onSourceLanguageChange: (value: string) => void;
  onTargetLanguageChange: (value: string) => void;
  onModelChange: (value: string) => void;
}

export default function LanguageEvaluationHeader({
  sourceLanguage,
  targetLanguage,
  selectedModel,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onModelChange,
}: LanguageEvaluationHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Language & Cross-Lingual QA Evaluation
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Reliability analysis across languages and multilingual models
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">Source Language:</label>
              <Select value={sourceLanguage} onValueChange={onSourceLanguageChange}>
                <SelectTrigger className="w-[150px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English (EN)</SelectItem>
                  <SelectItem value="VI">Vietnamese (VI)</SelectItem>
                  <SelectItem value="ZH">Chinese (ZH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400" />

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">Target Language:</label>
              <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
                <SelectTrigger className="w-[150px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VI">Vietnamese (VI)</SelectItem>
                  <SelectItem value="EN">English (EN)</SelectItem>
                  <SelectItem value="ZH">Chinese (ZH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">Model:</label>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="w-[200px] h-9 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="GPT-5.2">GPT-5.2</SelectItem>
                  <SelectItem value="Gemini 2.5 Flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="DeepSeek R1T2">DeepSeek R1T2 Chimera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
