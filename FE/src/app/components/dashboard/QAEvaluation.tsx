// app/(whatever)/qa-eval/QAEvaluation.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import ModelSection from "./qa-evaluation/ModelSection";
import QAEvaluationHeader from "./qa-evaluation/QAEvaluationHeader";
import CrossModelComparison from "./qa-evaluation/CrossModelComparison";

import type { ModelId, ModelSectionPayload } from "./qa-evaluation/qaEvalData";

const API_BASE = "http://localhost:4000";

export default function QAEvaluation() {
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-5.2");
  const [quality, setQuality] = useState("0.7"); // ✅ default 0.7

  const [data, setData] = useState<ModelSectionPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataset = "all";
  const experiment = "all";

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("modelId", selectedModel);
    params.set("threshold", quality); 
    params.set("dataset", dataset);
    params.set("experiment", experiment);

    return `${API_BASE}/qa-eval/model-section?${params.toString()}`;
  }, [selectedModel, quality, dataset, experiment]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(requestUrl, { cache: "no-store" });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const json = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load model data");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [requestUrl]);

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900">
      <div className="p-8 space-y-8">
        <QAEvaluationHeader
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          quality={quality}
          setQuality={setQuality}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Loading model evaluation...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-6">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Failed to load data
            </p>
            <p className="text-xs mt-2 text-red-600 dark:text-red-300/80 break-all">
              {error}
            </p>
          </div>
        )}

        {/* Animated Model Section */}
        <AnimatePresence mode="wait">
          {!loading && !error && data && (
            <ModelSection
              key={`${selectedModel}-${quality}`}
              modelId={selectedModel}
              data={data}
            />
          )}
        </AnimatePresence>

        <CrossModelComparison quality={quality} />
      </div>
    </div>
  );
}