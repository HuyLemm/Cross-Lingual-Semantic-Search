import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import type { QAPair } from './datasetGroundTruthData';

interface SourceViewSheetProps {
  qa: QAPair | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SourceViewSheet({ qa, isOpen, onClose }: SourceViewSheetProps) {
  if (!qa) return null;

  const highlightTextInContext = (text: string, highlights: string[]) => {
    let result = text;
    const parts: Array<{ text: string; highlighted: boolean }> = [];
    
    // Simple highlighting implementation
    let lastIndex = 0;
    highlights.forEach(highlight => {
      const index = result.toLowerCase().indexOf(highlight.toLowerCase(), lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: result.substring(lastIndex, index), highlighted: false });
        }
        parts.push({ text: result.substring(index, index + highlight.length), highlighted: true });
        lastIndex = index + highlight.length;
      }
    });
    
    if (lastIndex < result.length) {
      parts.push({ text: result.substring(lastIndex), highlighted: false });
    }
    
    return parts.length > 0 ? parts : [{ text: result, highlighted: false }];
  };

  const questionWords = qa.question.split(' ').filter(w => w.length > 4);
  const answerWords = qa.answer.split(' ').filter(w => w.length > 4);
  const highlightWords = [...questionWords.slice(0, 3), ...answerWords.slice(0, 3)];
  const parts = highlightTextInContext(qa.context, highlightWords);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>QA Pair Source Context</SheetTitle>
          <SheetDescription>
            Verify traceability and semantic grounding of QA pair
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* QA Pair Information */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">QA Pair ID</h3>
              <Badge variant="secondary" className="font-mono text-xs">{qa.id}</Badge>
            </div>
          </div>

          {/* Question */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Question</h3>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-900 dark:text-gray-100">{qa.question}</p>
            </div>
          </div>

          {/* Answer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Ground Truth Answer</h3>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-900 dark:text-gray-100">{qa.answer}</p>
            </div>
          </div>

          <Separator />

          {/* Similarity Scores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Q–Context</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{qa.qContextSimilarity.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">A–Context</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{qa.aContextSimilarity.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{qa.similarityScore.toFixed(2)}</p>
            </div>
          </div>

          {/* Source Document Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Source Document</h3>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Document:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{qa.documentTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Page Number:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{qa.pageNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Chunk ID:</span>
                <Badge variant="secondary" className="font-mono text-xs">{qa.sourceChunkId}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Language:</span>
                <Badge variant="outline" className="font-mono">{qa.language}</Badge>
              </div>
            </div>
          </div>

          {/* Source Context */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Source Context (with semantic highlighting)
            </h3>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                {parts.map((part, index) => 
                  part.highlighted ? (
                    <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
                      {part.text}
                    </mark>
                  ) : (
                    <span key={index}>{part.text}</span>
                  )
                )}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Yellow highlighting shows semantic overlap between QA and source context
            </p>
          </div>

          {/* Verification Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Verification Status</h3>
            <div className={`p-3 rounded-lg border ${
              qa.verificationStatus === 'Verified'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : qa.verificationStatus === 'Low Similarity'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <Badge className={
                qa.verificationStatus === 'Verified'
                  ? 'bg-green-600 text-white'
                  : qa.verificationStatus === 'Low Similarity'
                  ? 'bg-orange-600 text-white'
                  : 'bg-red-600 text-white'
              }>
                {qa.verificationStatus}
              </Badge>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                {qa.verificationStatus === 'Verified' && 'This QA pair passes all validation criteria and is grounded in verifiable source context.'}
                {qa.verificationStatus === 'Low Similarity' && 'Semantic similarity below threshold (0.80). May require manual review.'}
                {qa.verificationStatus === 'Language Mismatch' && 'Language inconsistency detected between question, answer, and context.'}
              </p>
            </div>
          </div>

          {/* Model & Dataset Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">Generated by Model</h3>
              <Badge variant="secondary">{qa.model}</Badge>
            </div>
            <div>
              <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">Dataset</h3>
              <Badge variant="outline">{qa.dataset}</Badge>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
