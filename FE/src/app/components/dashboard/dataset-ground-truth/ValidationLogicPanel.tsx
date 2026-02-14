import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Info, CheckCircle, XCircle } from "lucide-react";

export default function ValidationLogicPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Validation Logic & Criteria
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* ================= MAIN CRITERIA ================= */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* BI + CE THRESHOLD */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Semantic Validation (Bi + Cross Encoder)
            </h4>

            <ul className="text-xs text-green-800 dark:text-green-400 space-y-1">
              <li>• <strong>Verified:</strong> Bi ≥ 0.70 AND CE ≥ 0.70</li>
              <li>• Bi-Encoder: Question ↔ Context similarity</li>
              <li>• Cross-Encoder: Entailment validation</li>
              <li>• Ensures semantic grounding to source</li>
            </ul>
          </div>

          {/* TRACEABILITY */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Source Traceability
            </h4>

            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• QA linked to exact source chunk</li>
              <li>• Chunk mapped to original PDF</li>
              <li>• Page + metadata preserved</li>
              <li>• Full provenance guaranteed</li>
            </ul>
          </div>

          {/* LANGUAGE */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Language Consistency
            </h4>

            <ul className="text-xs text-purple-800 dark:text-purple-400 space-y-1">
              <li>• Question / Answer / Context match</li>
              <li>• EN and VI tracked separately</li>
              <li>• Cross-lingual explicitly labeled</li>
              <li>• Encoding integrity verified</li>
            </ul>
          </div>
        </div>

        {/* ================= REJECTION ================= */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Rejection Criteria (Non-Verified QA)
          </h4>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">
                Low Semantic Confidence
              </p>

              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                <li>• Bi &lt; 0.70 OR CE &lt; 0.70</li>
                <li>• Weak grounding to source</li>
                <li>• Possible hallucination</li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                Structural / Language Issues
              </p>

              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                <li>• Missing source mapping</li>
                <li>• Language mismatch</li>
                <li>• Incomplete metadata</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= WHY IMPORTANT ================= */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Why This Matters for Dataset Reliability
          </h4>

          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            These validation rules ensure every QA pair is grounded in verifiable
            document evidence rather than hallucination. By enforcing both
            Bi-Encoder semantic similarity and Cross-Encoder entailment, the
            dataset maintains high trustworthiness for retrieval evaluation.
            Each verified QA becomes reliable ground truth for measuring semantic
            search quality, recall, and cross-lingual performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
