import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { Info, CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

export default function ValidationLogicPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Validation Logic & Criteria
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Semantic Similarity Threshold
                </h4>
                <ul className="text-xs text-green-800 dark:text-green-400 space-y-1">
                  <li>• <strong>Verified:</strong> Similarity ≥ 0.80</li>
                  <li>• Question-Context similarity score</li>
                  <li>• Answer-Context similarity score</li>
                  <li>• Computed using embedding models</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Traceability Check
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Valid source chunk ID exists</li>
                  <li>• Chunk maps to specific document</li>
                  <li>• Page number and position tracked</li>
                  <li>• Full provenance lineage verified</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Language Consistency
                </h4>
                <ul className="text-xs text-purple-800 dark:text-purple-400 space-y-1">
                  <li>• Question, Answer, Context language match</li>
                  <li>• Cross-lingual pairs explicitly labeled</li>
                  <li>• No mixing without translation marker</li>
                  <li>• Unicode encoding validated</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Rejection Criteria (Non-Verified QA Pairs)
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Low Similarity Warning:</p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                    <li>• Similarity score &lt; 0.80</li>
                    <li>• Weak semantic connection to source</li>
                    <li>• Potential hallucination risk</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Language Mismatch Error:</p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                    <li>• Question/Answer/Context language conflict</li>
                    <li>• Unlabeled cross-lingual content</li>
                    <li>• Requires manual review</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Why This Matters for Research Validity:</h4>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                These validation criteria ensure that every QA pair used in retrieval evaluation is <strong>grounded in verifiable source documents</strong>, 
                not generated through hallucination. This traceability is essential for academic research, as it allows reviewers to verify that 
                evaluation metrics reflect true retrieval performance rather than model confabulation. Each validated QA pair serves as a 
                trustworthy ground truth for measuring semantic search accuracy, recall, and precision across languages.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
