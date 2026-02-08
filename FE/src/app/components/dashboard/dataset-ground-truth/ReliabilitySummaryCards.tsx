import { Card, CardContent } from "../../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";

interface ReliabilitySummaryCardsProps {
  totalDocuments: number;
  totalQAPairs: number;
  verifiedQAPairs: number;

  avgBiEncoder: number;
  avgCrossEncoder: number;
  validationRate: number;
  step1OnlyRate: number;
}

export default function ReliabilitySummaryCards({
  totalDocuments = 0,
  totalQAPairs = 0,
  verifiedQAPairs = 0,
  validationRate = 0,
  avgBiEncoder = 0,
  avgCrossEncoder = 0,
  step1OnlyRate = 0,
}: ReliabilitySummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
      {/* 1. Total Documents */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="Total Documents"
            value={totalDocuments}
            tooltip="Number of source PDF documents"
          />
        </CardContent>
      </Card>

      {/* 2. Total QA */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="Total QA"
            value={totalQAPairs}
            tooltip="All generated QA pairs after filtering"
          />
        </CardContent>
      </Card>

      {/* 3. Verified QA (Step 1 + 2) */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="Verified QA (Final)"
            value={verifiedQAPairs}
            valueClass="text-green-600 dark:text-green-400"
            tooltip="QA passing both Bi-Encoder (Step 1) and Cross-Encoder (Step 2)"
          />
        </CardContent>
      </Card>

      {/* 4. QA Validation Rate */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="QA Validation Rate"
            value={`${validationRate.toFixed(1)}%`}
            valueClass="text-purple-600 dark:text-purple-400"
            tooltip="Final acceptance rate = verified_final / total_QA"
          />
        </CardContent>
      </Card>

      {/* 5. Avg Step 1 */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="Avg Bi-Encoder Score"
            value={avgBiEncoder.toFixed(2)}
            valueClass="text-blue-600 dark:text-blue-400"
            tooltip="Mean(sim_qc) — semantic relevance (Step 1)"
          />
        </CardContent>
      </Card>

      {/* 6. Avg Step 2 */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="Avg Cross-Encoder Score"
            value={avgCrossEncoder.toFixed(2)}
            valueClass="text-indigo-600 dark:text-indigo-400"
            tooltip="Mean(ce_multi_prob) — entailment confidence (Step 2)"
          />
        </CardContent>
      </Card>

      {/* 7. Step 1 Pass but Step 2 Fail */}
      <Card>
        <CardContent className="p-5">
          <Metric
            label="Step-1 Only Pass Rate"
            value={`${step1OnlyRate.toFixed(1)}%`}
            valueClass="text-orange-600 dark:text-orange-400"
            tooltip="QA passing Bi-Encoder but rejected by Cross-Encoder"
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================
 * Small reusable metric UI
 * ========================= */
function Metric({
  label,
  value,
  tooltip,
  valueClass = "text-gray-900 dark:text-white",
}: {
  label: string;
  value: string | number;
  tooltip: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-4 h-4 text-gray-400" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
