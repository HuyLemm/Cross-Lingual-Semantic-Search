import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function TraceabilityVisualization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QA Dataset Generation & Verification Pipeline</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-slate-800 dark:to-slate-700 p-10 rounded-xl">

          {/* ================= PIPELINE ================= */}
          <div className="flex items-center justify-center gap-8 flex-wrap">

            <StepBox
              color="bg-blue-500"
              icon="📥"
              title="1. Crawl PDFs"
              desc="VJOL (VI) + Semantic Scholar (EN)"
            />

            <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />

            <StepBox
              color="bg-indigo-500"
              icon="🤖"
              title="2. Generate QA"
              desc="LLMs generate 7 QA per iteration"
            />

            <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />

            <StepBox
              color="bg-cyan-500"
              icon="🧹"
              title="3. Preprocess"
              desc="Dedup + Title filtering"
            />

            <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />

            <StepBox
              color="bg-purple-500"
              icon="⚙️"
              title="4. Normalize + Validate"
              desc="Metadata → Bi-Encoder → Cross-Encoder"
            />

            <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />

            <StepBox
              color="bg-green-500"
              icon="✔"
              title="5. Verified QA"
              desc="Pass BOTH validation stages"
            />
          </div>

          {/* LOOP */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400">
            <RotateCcw className="w-4 h-4" />
            Repeat until each document reaches <span className="font-semibold">≥ 7 verified QA pairs</span>
          </div>

          {/* ================= DESCRIPTION ================= */}
          <div className="mt-8 max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">Iterative QA Construction:</span>{" "}
              Documents are crawled from Vietnamese (VJOL) and English (Semantic Scholar).
              QA pairs are generated in controlled batches, preprocessed, normalized,
              and semantically validated using a Bi-Encoder and Cross-Encoder.
              Only QA pairs passing both validation stages are accepted, ensuring
              high-quality, semantically grounded dataset construction.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= STEP BOX ================= */

function StepBox({
  color,
  icon,
  title,
  desc,
}: {
  color: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center w-[150px]">
      <div
        className={`w-20 h-20 ${color} rounded-xl flex items-center justify-center shadow-md`}
      >
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug">
        {desc}
      </p>
    </div>
  );
}
