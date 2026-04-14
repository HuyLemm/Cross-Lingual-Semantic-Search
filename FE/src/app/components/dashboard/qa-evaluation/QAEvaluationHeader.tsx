// app/(whatever)/qa-eval/components/QAEvaluationHeader.tsx
"use client";

import type { ModelId } from "./qaEvalData";

interface Props {
  selectedModel: ModelId;
  setSelectedModel: (v: ModelId) => void;

  quality: string;
  setQuality: (v: string) => void;
}

const TABS: { id: ModelId; label: string }[] = [
  { id: "gpt-5.2", label: "GPT-5.2" },
  { id: "gemini-2.5", label: "Gemini 2.5 Flash" },
  { id: "deepseek-r1t2", label: "DeepSeek R1T2" },
];

export default function QAEvaluationHeader({
  selectedModel,
  setSelectedModel,
  quality,
  setQuality,
}: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
        Question Answering Evaluation Dashboard
      </h2>

      {/* Tabs + Quality cùng 1 hàng */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Model Tabs */}
        <div className="inline-flex rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-1">
          {TABS.map((t) => {
            const active = t.id === selectedModel;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedModel(t.id)}
                className={[
                  "px-4 py-2 text-sm rounded-lg transition",
                  active
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Quality selector đặt ngay bên cạnh */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Quality:
          </span>

          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
          >
            <option value="0.7">0.7</option>
            <option value="0.8">0.8</option>
          </select>
        </div>
      </div>
    </div>
  );
}