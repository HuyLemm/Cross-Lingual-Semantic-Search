import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

export default function Recommendations() {
  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-gray-700 dark:text-slate-300">
          Recommendation Summary (Based on Top-1 Gains)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* BGE+CE */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-600 dark:border-purple-500 rounded">
            <div className="flex items-start">
              <Badge className="bg-purple-600 text-white mt-0.5">BGE-M3 + CE</Badge>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  Recommended Default: Quality-First Retrieval
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  BGE-M3 + CE consistently improves <span className="font-semibold">Top-1</span> over MiniLM across
                  all settings, with gains ranging from{' '}
                  <span className="font-mono font-semibold text-purple-700 dark:text-purple-300">+3.9%</span> to{' '}
                  <span className="font-mono font-semibold text-purple-700 dark:text-purple-300">+15.1%</span>.
                  Strongest improvements appear in <span className="font-semibold">Vietnamese</span> (e.g., DeepSeek τ=0.7).
                </p>
              </div>
            </div>
          </div>

          {/* MiniLM */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-600 dark:border-blue-500 rounded">
            <div className="flex items-start">
              <Badge className="bg-blue-600 text-white mt-0.5">MiniLM</Badge>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  Use When: Speed / Cost-Sensitive Mode
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  Choose MiniLM if your production constraints prioritize{' '}
                  <span className="font-semibold">lower latency or compute cost</span>. It performs reasonably well,
                  but the data indicates it is consistently below BGE-M3 + CE on Top-K metrics.
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-2">
                  Tip: If you measure latency later, you can state the exact trade-off (e.g., “+X ms for +Y% Top-1”).
                </p>
              </div>
            </div>
          </div>

          {/* Hybrid */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-600 dark:border-emerald-500 rounded">
            <div className="flex items-start">
              <Badge className="bg-emerald-600 text-white mt-0.5">Hybrid</Badge>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  Best Practical Strategy: Adaptive Routing
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  Use MiniLM for fast initial retrieval, then apply BGE-M3 + CE selectively:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-slate-300 space-y-1">
                  <li>
                    Always enable BGE-M3 + CE for <span className="font-semibold">Vietnamese</span> queries
                    (largest gains observed).
                  </li>
                  <li>
                    Enable BGE-M3 + CE when using <span className="font-semibold">τ=0.7</span> (generally bigger uplift).
                  </li>
                  <li>
                    Enable BGE-M3 + CE for “high-importance” queries (research, academic, critical search flows).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}