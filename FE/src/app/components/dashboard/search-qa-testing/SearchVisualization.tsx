"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ArrowRight } from "lucide-react";

export default function SearchVisualization() {
  return (
    <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wide">
          Search Pipeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 text-center mb-4">
            End-to-end: Build Index → Query → Retrieve → Rerank → Return
          </p>

          {/* ================= ONE MERGED PIPELINE ================= */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <StepBox
              color="bg-indigo-600"
              icon="🗂️"
              title="1. Build Corpus Index"
              desc="Load docs → chunk → normalize → embed chunks → L2 → build FAISS → save"
              badge="1–7"
            />

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />

            <StepBox
              color="bg-blue-500"
              icon="⌨️"
              title="2. User Query"
              desc="User enters a question"
              badge="8"
            />

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />

            <StepBox
              color="bg-cyan-500"
              icon="🧼"
              title="3. Prepare Query"
              desc="Normalize query + extract keywords/facts"
              badge="9–10"
            />

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />

            <StepBox
              color="bg-fuchsia-500"
              icon="🧠"
              title="4. Encode Query"
              desc="Query embedding + L2 normalization"
              badge="11–12"
            />

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />

            <StepBox
              color="bg-purple-500"
              icon="⚡"
              title="5. Retrieve Candidates"
              desc="FAISS stage-1 retrieval → select top-N candidates"
              badge="13–14"
            />

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />

            <StepBox
              color="bg-rose-500"
              icon="🧪"
              title="6. Rerank & Sort"
              desc="Stage-2 rerank → sort by relevance score"
              badge="15–16"
            />

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />

            <StepBox
              color="bg-emerald-500"
              icon="✅"
              title="7. Return Results"
              desc="Return top_k final ranked results"
              badge="17"
            />
          </div>

          {/* ===== Small legend (Old vs New models) ===== */}
          <div className="mt-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniCard
              title="Old method (baseline)"
              bullets={[
                "Chunk/query embeddings: MiniLM",
                "FAISS: IndexFlatIP CPU",
                "Stage-2: Hybrid scoring",
                "Ranking: Heuristic score",
              ]}
            />
            <MiniCard
              title="New method (upgraded)"
              bullets={[
                "Chunk/query embeddings: BGE-M3",
                "FAISS: IndexFlatIP CPU (72 threads)",
                "Stage-2: bge-reranker-v2-m3 (cross-encoder)",
                "Ranking: Cross-encoder score",
              ]}
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
            Common steps are grouped into higher-level stages while preserving the original workflow.
          </p>
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
  badge,
}: {
  color: string;
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center w-[170px]">
      <div className="relative">
        <div
          className={`w-20 h-20 ${color} rounded-xl flex items-center justify-center shadow-md`}
        >
          <span className="text-2xl">{icon}</span>
        </div>

        {badge && (
          <div className="absolute -top-2 -right-2 text-[10px] px-2 py-[2px] rounded-full bg-white/90 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold">
            {badge}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug break-words">
        {desc}
      </p>
    </div>
  );
}

/* ================= MINI CARD ================= */

function MiniCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300 list-disc pl-5">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}