import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function ProcessingPipeline() {
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

            {/* ✅ NEW STEP */}
            <StepBox
              color="bg-fuchsia-500"
              icon="🧩"
              title="4. Chunk Traceability"
              desc="Extract → Chunk → Assign chunk_id"
            />

            <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />

            <StepBox
              color="bg-purple-500"
              icon="⚙️"
              title="5. Normalize + Validate"
              desc="Metadata → Bi-Encoder → Cross-Encoder"
            />

            <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />

            <StepBox
              color="bg-green-500"
              icon="✔"
              title="6. Verified QA"
              desc="Pass BOTH validation stages"
            />
          </div>

          {/* ✅ NEW: Branch details under step 4 */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BranchCard
                title="PDF has selectable text"
                bullets={[
                  "pypdf extract_text() (normal)",
                  "Chunking hard cap ≤ 4000 chars",
                  "Assign: chunk_id, chunk_char_len, chunk_preview",
                ]}
                footer="used_ocr = false"
              />

              <BranchCard
                title="PDF is image-based / scanned"
                bullets={[
                  "Normal extract empty → OCR fallback",
                  "pdf2image + pytesseract (Poppler required)",
                  "Chunking ≤ 4000 chars → Assign same fields",
                ]}
                footer="used_ocr = true"
              />
            </div>
          </div>

          {/* LOOP */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400">
            <RotateCcw className="w-4 h-4" />
            Repeat until each document reaches{" "}
            <span className="font-semibold">≥ 7 verified QA pairs</span>
          </div>

          {/* ================= DESCRIPTION ================= */}
          <div className="mt-8 max-w-4xl mx-auto text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">Iterative QA Construction:</span>{" "}
              Documents are crawled from Vietnamese (VJOL) and English (Semantic
              Scholar). QA pairs are generated in controlled batches,
              preprocessed, then mapped back to document chunks for{" "}
              <span className="font-semibold">traceability</span> (chunk_id,
              chunk length, and preview). For scanned PDFs, OCR fallback is used.
              Finally, QA pairs are semantically validated using a Bi-Encoder and
              Cross-Encoder. Only pairs passing both validation stages are kept.
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

/* ================= BRANCH CARD ================= */

function BranchCard({
  title,
  bullets,
  footer,
}: {
  title: string;
  bullets: string[];
  footer: string;
}) {
  return (
    <div className="rounded-xl border bg-white/70 dark:bg-slate-900/40 p-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>

      <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300 list-disc pl-5">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <div className="mt-3 text-[11px] text-gray-600 dark:text-gray-400 font-mono">
        {footer}
      </div>
    </div>
  );
}