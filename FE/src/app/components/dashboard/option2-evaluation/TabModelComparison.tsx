"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Loader2 } from "lucide-react";

import { MODEL_COLORS } from "./option2.constants";

type ModelName = "DeepSeek" | "Gemini" | "GPT";
type Language = "EN" | "VI";
type Threshold = "Baseline" | "0.7" | "0.8" | "All QAs";

type FacetedDatum = {
  model: ModelName;
  language: Language;
  threshold: Threshold;
  value: number; // 0..1
};

type ThresholdSensitivityDatum = {
  threshold: "Baseline" | "0.7" | "0.8";
  DeepSeek: number;
  Gemini: number;
  GPT: number;
};

type TopKDatum = {
  k: 1 | 3 | 5 | 10;
  DeepSeek: number;
  Gemini: number;
  GPT: number;
};

type TopKSummaryRow = {
  model: ModelName;
  top1: number;
  top3: number;
  top5: number;
  top10: number;
  gain: number;
};

type ModelComparisonResponse = {
  generatedAt: string;
  baseDir: string;
  availableModels: ModelName[];
  facetedData: FacetedDatum[];
  thresholdSensitivity: ThresholdSensitivityDatum[];
  topKData: TopKDatum[];
  topKSummary: TopKSummaryRow[];
  counts: { filesFound: number; parsedConfigs: number };
  warning?: string;
};

// ✅ Language colors (fixed, consistent)
const LANG_COLORS: Record<Language, string> = {
  EN: "#3b82f6", // blue
  VI: "#10b981", // green
};

const API_BASE = "http://localhost:4000";

function normalizeThreshold(t: string): Threshold {
  // backend có thể trả "All QAs" hoặc "All QAs " ...
  const s = (t || "").trim();
  if (s === "Baseline" || s === "0.7" || s === "0.8" || s === "All QAs") return s as Threshold;
  // fallback: treat others as All QAs
  return "All QAs";
}

/**
 * Pivot facetedData (many rows) -> chart rows per threshold:
 * [
 *   { threshold: "0.7", EN: 0.83, VI: 0.80 },
 *   { threshold: "0.8", EN: 0.86, VI: 0.82 },
 *   { threshold: "All QAs", EN: 0.85, VI: 0.81 },
 * ]
 */
function buildPivotByThreshold(modelData: FacetedDatum[]) {
  const order: Threshold[] = ["0.7", "0.8", "All QAs"];

  const map = new Map<Threshold, { threshold: Threshold; EN: number | null; VI: number | null }>();

  for (const d of modelData) {
    const th = normalizeThreshold(d.threshold);
    if (!map.has(th)) map.set(th, { threshold: th, EN: null, VI: null });

    const row = map.get(th)!;
    row[d.language] = d.value;
  }

  // ensure all thresholds appear (even if missing -> null)
  for (const th of order) {
    if (!map.has(th)) map.set(th, { threshold: th, EN: null, VI: null });
  }

  return order.map((th) => map.get(th)!);
}

export default function TabModelComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ModelComparisonResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/evaluation/option2/model-comparison`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as ModelComparisonResponse;
        console.log(json);
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load model comparison");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const facetedData = data?.facetedData ?? [];
  const thresholdSensitivity = data?.thresholdSensitivity ?? [];
  const topKData = data?.topKData ?? [];
  const topKSummary = data?.topKSummary ?? [];

  const hasAny = useMemo(
    () => facetedData.length || thresholdSensitivity.length || topKData.length || topKSummary.length,
    [facetedData.length, thresholdSensitivity.length, topKData.length, topKSummary.length],
  );

  if (loading) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm text-gray-600 dark:text-slate-400">
          Loading model comparison...
        </span>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-gray-200 dark:border-slate-700">
          <CardContent className="py-6">
            <p className="text-sm font-semibold text-red-600">Failed to load</p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAny) {
    return (
      <div className="space-y-4">
        <Card className="border-gray-200 dark:border-slate-700">
          <CardContent className="py-10 text-center text-sm text-gray-600 dark:text-slate-400">
            No data found. Check your TXT folder path and filename pattern.
          </CardContent>
        </Card>
        {data?.warning ? <p className="text-xs text-amber-600">{data.warning}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Optional debug */}
      {data?.baseDir ? (
        <p className="text-[13px] text-gray-500 dark:text-slate-500">
          Source: <span className="font-mono">{data.baseDir}</span>
          {typeof data?.counts?.parsedConfigs === "number" ? (
            <>
              {" "}
              • parsed <span className="font-mono">{data.counts.parsedConfigs}</span> configs
            </>
          ) : null}
        </p>
      ) : null}

      {/* 4.1 Model-Level Comparison */}
      <div className="space-y-4">
        <div className="border-l-4 border-blue-600 pl-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            4.1 Model-Level Comparison
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Performance breakdown by model, language, and threshold setting
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(["DeepSeek", "Gemini", "GPT"] as const).map((modelName) => {
            const modelRows = facetedData.filter((d) => d.model === modelName);
            const pivot = buildPivotByThreshold(modelRows);

            const baselineEN = pivot.find((r) => r.threshold === "Baseline")?.EN ?? 0;

            return (
              <Card key={modelName} className="border-gray-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {/* ✅ Model color only here (avoid chart confusion) */}
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: MODEL_COLORS[modelName] }} />
                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      {modelName}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={pivot}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="threshold" tick={{ fontSize: 9 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 9 }} />

                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;

                          // payload will contain EN + VI bars if present
                          // show both lines in tooltip
                          const rows = payload
                            .filter((p) => p?.dataKey === "EN" || p?.dataKey === "VI")
                            .map((p) => ({
                              lang: p.dataKey as Language,
                              val: typeof p.value === "number" ? p.value : null,
                            }));

                          return (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 shadow-lg">
                              <p className="text-xs font-semibold">{String(label)}</p>

                              {rows.map((r) => {
                                if (r.val == null) return null;
                                const delta = ((r.val - baselineEN) * 100).toFixed(1);
                                return (
                                  <div key={r.lang} className="mt-1">
                                    <p className="text-xs">
                                      <span
                                        className="inline-block w-2 h-2 rounded mr-2 align-middle"
                                        style={{ backgroundColor: LANG_COLORS[r.lang] }}
                                      />
                                      <span className="font-semibold">{r.lang}</span>{" "}
                                      <span className="font-mono">{(r.val * 100).toFixed(1)}%</span>
                                    </p>
                                    {String(label) !== "Baseline" && r.lang === "EN" ? (
                                      <p className="text-[13px] text-green-600">EN Δ: +{delta}% vs Baseline</p>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />

                      {/* ✅ EN/VI colors fixed & consistent */}
                      <Legend
                        wrapperStyle={{ fontSize: "13px" }}
                        iconSize={10}
                        formatter={(value) => (value === "EN" ? "English (EN)" : value === "VI" ? "Vietnamese (VI)" : value)}
                      />

                      <Bar dataKey="EN" name="EN" fill={LANG_COLORS.EN} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="VI" name="VI" fill={LANG_COLORS.VI} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* ✅ Clear note: colors are language, NOT model */}
                  <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-2 text-center">
                    Bar colors indicate language: <span className="font-semibold">EN</span> (blue) vs{" "}
                    <span className="font-semibold">VI</span> (green). Model color is shown only in the header.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4.2 Threshold Filtering Analysis */}
      <div className="space-y-4">
        <div className="border-l-4 border-emerald-600 pl-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            4.2 Threshold Filtering Analysis
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Impact of similarity threshold filtering on retrieval accuracy
          </p>
        </div>

        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Threshold Filtering Effect on Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={thresholdSensitivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="threshold" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0.82, 0.93]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Top-1 Accuracy",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />

                {/* ✅ Here, color by MODEL (lines are models) */}
                <Line type="monotone" dataKey="DeepSeek" stroke={MODEL_COLORS.DeepSeek} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Gemini" stroke={MODEL_COLORS.Gemini} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="GPT" stroke={MODEL_COLORS.GPT} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 italic text-center">
              Accuracy consistently improves with stricter similarity filtering across all models, with average gain of +4–5%.
            </p>
          </CardContent>
        </Card>

        {/* Threshold Impact Table (giữ nguyên số như bản gốc của bạn) */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Threshold Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Threshold</th>
                  <th className="text-center py-3 px-4 font-semibold">Avg Dataset Size</th>
                  <th className="text-center py-3 px-4 font-semibold">Avg Top-1</th>
                  <th className="text-center py-3 px-4 font-semibold">Accuracy Gain</th>
                  <th className="text-center py-3 px-4 font-semibold">Data Reduction</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-850">
                <tr className="border-t border-gray-100 dark:border-slate-800">
                  <td className="py-3 px-4 font-mono">Baseline</td>
                  <td className="py-3 px-4 text-center font-mono">1115</td>
                  <td className="py-3 px-4 text-center font-mono">83.2%</td>
                  <td className="py-3 px-4 text-center font-mono">-</td>
                  <td className="py-3 px-4 text-center font-mono">-</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-slate-800">
                  <td className="py-3 px-4 font-mono">0.7</td>
                  <td className="py-3 px-4 text-center font-mono">1050</td>
                  <td className="py-3 px-4 text-center font-mono">85.1%</td>
                  <td className="py-3 px-4 text-center font-mono text-green-600">+1.9%</td>
                  <td className="py-3 px-4 text-center font-mono">5.8%</td>
                </tr>
                <tr className="border-t border-gray-100 dark:border-slate-800">
                  <td className="py-3 px-4 font-mono">0.8</td>
                  <td className="py-3 px-4 text-center font-mono">930</td>
                  <td className="py-3 px-4 text-center font-mono">87.5%</td>
                  <td className="py-3 px-4 text-center font-mono text-green-600">+4.3%</td>
                  <td className="py-3 px-4 text-center font-mono">16.6%</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* 4.3 Top-K Retrieval Behavior */}
      <div className="space-y-4">
        <div className="border-l-4 border-purple-600 pl-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">4.3 Top-K Retrieval Behavior</h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Analysis of retrieval performance across different Top-K values
          </p>
        </div>

        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Top-K Accuracy Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={topKData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis
                  dataKey="k"
                  tick={{ fontSize: 11 }}
                  label={{ value: "K", position: "insideBottom", offset: -5, fontSize: 11 }}
                />
                <YAxis
                  domain={[0.85, 1]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Accuracy", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />

                {/* ✅ color by MODEL (lines are models) */}
                <Line type="monotone" dataKey="DeepSeek" stroke={MODEL_COLORS.DeepSeek} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Gemini" stroke={MODEL_COLORS.Gemini} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="GPT" stroke={MODEL_COLORS.GPT} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Model</th>
                  <th className="text-center py-3 px-4 font-semibold">Top-1</th>
                  <th className="text-center py-3 px-4 font-semibold">Top-3</th>
                  <th className="text-center py-3 px-4 font-semibold">Top-5</th>
                  <th className="text-center py-3 px-4 font-semibold">Top-10</th>
                  <th className="text-center py-3 px-4 font-semibold">Gain (1→10)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-850">
                {topKSummary.map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-slate-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: MODEL_COLORS[row.model] }} />
                        <span className="font-semibold">{row.model}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{(row.top1 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center font-mono">{(row.top3 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center font-mono">{(row.top5 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center font-mono">{(row.top10 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center font-mono text-green-600">
                      +{(row.gain * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 italic">
              All models show monotonic improvement with increasing K. Larger Top-1 to Top-10 gain suggests stronger recall depth.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}