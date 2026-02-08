import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function TraceabilityVisualization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QA → Document → Chunk Traceability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-lg">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="text-center flex-shrink-0">
              <div className="w-28 h-28 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                <span className="text-4xl">❓</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Question</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">User Query</p>
            </div>
            
            <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-500 flex-shrink-0 mx-4" />
            
            <div className="text-center flex-shrink-0">
              <div className="w-28 h-28 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                <span className="text-4xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Ground Truth Answer</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Expected Response</p>
            </div>
            
            <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-500 flex-shrink-0 mx-4" />
            
            <div className="text-center flex-shrink-0">
              <div className="w-28 h-28 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                <span className="text-4xl">🔖</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Source Chunk</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Text Segment</p>
            </div>
            
            <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-500 flex-shrink-0 mx-4" />
            
            <div className="text-center flex-shrink-0">
              <div className="w-28 h-28 bg-orange-500 dark:bg-orange-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                <span className="text-4xl">📄</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">PDF Document</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Source Paper</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              <span className="font-semibold">Full Traceability Guarantee:</span> Each QA pair is explicitly linked to a specific text chunk 
              extracted from the source document, ensuring full provenance tracking and enabling verification 
              that answers are grounded in actual document content, not hallucinated.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
