"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { MODEL_COLORS } from "./option1.constants";
import { Loader2 } from "lucide-react";

type ModelName = "DeepSeek" | "Gemini" | "GPT";
type Threshold = "0.7" | "0.8" | "All QAs";
type MetricKey = "top1" | "top3" | "top5" | "top10";

type MetricPack = {
  top1: number | null;
  top3: number | null;
  top5: number | null;
  top10: number | null;
};

type Row = {
  id: string;
  model: ModelName;
  threshold: Threshold;
  EN: MetricPack;
  VI: MetricPack;
};

type ApiResp = {
  generatedAt: string;
  baseDir: string;
  availableModels: ModelName[];
  rows: Row[];
  counts?: { filesFound: number; parsedConfigs: number };
  warning?: string;
};

const LANG_COLORS = {
  EN: "#3b82f6",
  VI: "#10b981",
};

function isFiniteNumber(v: any): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function fmtPct(v: number | null | undefined) {
  if (!isFiniteNumber(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function prettyMetric(m: MetricKey) {
  if (m === "top1") return "Top-1";
  if (m === "top3") return "Top-3";
  if (m === "top5") return "Top-5";
  return "Top-10";
}

function prettyThreshold(t: Threshold | "all") {
  if (t === "all") return "All";
  return t;
}

const MODEL_SHORT = {
  DeepSeek: "Deep",
  Gemini: "Gem",
  GPT: "GPT",
} as const;

export default function TabLanguage() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ client-side filters (NO refetch -> no scroll jump)
  const [thresholdFilter, setThresholdFilter] = useState<Threshold | "all">("all");
  const [metricFilter, setMetricFilter] = useState<MetricKey>("top1");

  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${API_BASE}/evaluation/option1/language-matrix`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} ${t}`.trim());
        }

        const json = (await res.json()) as ApiResp;
        if (!cancelled) setData(json);
      } catch (err: any) {
        if (!cancelled) setErrorMsg(String(err?.message || err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const rowsAll = data?.rows ?? [];

  const rowsFiltered = useMemo(() => {
    if (thresholdFilter === "all") return rowsAll;
    return rowsAll.filter((r) => r.threshold === thresholdFilter);
  }, [rowsAll, thresholdFilter]);

  // ✅ chart rows: one bar-group per (model, threshold)
  const chartData = useMemo(() => {
    return rowsFiltered.map((r) => {
      const en = r.EN?.[metricFilter] ?? null;
      const vi = r.VI?.[metricFilter] ?? null;

      return {
        ...r,
        label: `${MODEL_SHORT[r.model]} ${r.threshold}`,
        EN_val: isFiniteNumber(en) ? en : null,
        VI_val: isFiniteNumber(vi) ? vi : null,
      };
    });
  }, [rowsFiltered, metricFilter]);

  // ✅ table rows use same filtered list
  const tableRows = useMemo(() => {
    return rowsFiltered.map((r) => {
      const en = r.EN?.[metricFilter] ?? null;
      const vi = r.VI?.[metricFilter] ?? null;

      const gapPct =
        isFiniteNumber(en) && isFiniteNumber(vi) ? (en - vi) * 100 : null;

      const crossLingualScore =
        isFiniteNumber(en) && en > 0 && isFiniteNumber(vi) ? vi / en : null;

      return {
        ...r,
        enVal: en,
        viVal: vi,
        gapPct,
        crossLingualScore,
      };
    });
  }, [rowsFiltered, metricFilter]);

  if (loading) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm text-gray-600 dark:text-slate-400">
          Loading language comparison...
        </span>
      </div>
    </div>
  );
}

  if (errorMsg) {
    return (
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Failed to load language tab
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-red-600 whitespace-pre-wrap">
          {errorMsg}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {data?.warning ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="py-3 text-xs text-amber-900 dark:text-amber-200">
            {data.warning}
            <div className="mt-1 text-[13px] opacity-80">
              baseDir: <span className="font-mono">{data.baseDir}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters (NO refetch) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Threshold */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-sm">
          {(["all", "0.7", "0.8", "All QAs"] as const).map((t) => {
            const active = thresholdFilter === t;
            return (
              <button
                key={t}
                type="button" // ✅ prevent form-submit jump
                onClick={() => setThresholdFilter(t)}
                className={[
                  "px-3 py-1 text-[13px] rounded-lg transition font-semibold",
                  active
                    ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {prettyThreshold(t)}
              </button>
            );
          })}
        </div>

        {/* Metric */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-sm">
          {(["top1", "top3", "top5", "top10"] as const).map((m) => {
            const active = metricFilter === m;
            return (
              <button
                key={m}
                type="button" // ✅ prevent form-submit jump
                onClick={() => setMetricFilter(m)}
                className={[
                  "px-3 py-1 text-[13px] rounded-lg transition font-semibold",
                  active
                    ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {prettyMetric(m)}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold
              bg-sky-100 text-sky-800 border border-sky-200
              dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900/40"
          >
            Threshold: {prettyThreshold(thresholdFilter)}
          </span>

          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold
              bg-amber-100 text-amber-800 border border-amber-200
              dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/40"
          >
            Metric: {prettyMetric(metricFilter)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              English vs Vietnamese Performance (Model–Threshold)
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              X-axis is grouped by model and threshold (e.g., Deep 0.7 / Deep 0.8 / Deep All QAs).
            </p>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

                <XAxis
                  dataKey="label"
                  interval={0}
                  height={90}
                  tick={{ fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                />

                <YAxis
                  domain={["dataMin - 0.02", "dataMax + 0.02"]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d: any = payload[0]?.payload;

                    return (
                      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-semibold">
                          {d.model} - {d.threshold}
                        </p>
                        <p className="text-xs mt-1">
                          <span className="font-semibold">EN:</span>{" "}
                          <span className="font-mono">{fmtPct(d.EN_val)}</span>
                        </p>
                        <p className="text-xs">
                          <span className="font-semibold">VI:</span>{" "}
                          <span className="font-mono">{fmtPct(d.VI_val)}</span>
                        </p>
                      </div>
                    );
                  }}
                />

                <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />

                {/* ✅ fixed colors by language */}
                <Bar dataKey="EN_val" fill={LANG_COLORS.EN} name="English (EN)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="VI_val" fill={LANG_COLORS.VI} name="Vietnamese (VI)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 text-center">
              Language colors are fixed: EN (blue) vs VI (green). Model colors are shown in the table.
            </p>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Language Performance Gap Analysis (Model–Threshold)
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Gap = EN − VI. Cross-Lingual Score = VI / EN (closer to 1.0 is better).
            </p>
          </CardHeader>

          <CardContent>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Model</th>
                  <th className="text-left py-3 px-4 font-semibold">Threshold</th>
                  <th className="text-center py-3 px-4 font-semibold">EN</th>
                  <th className="text-center py-3 px-4 font-semibold">VI</th>
                  <th className="text-center py-3 px-4 font-semibold">Gap</th>
                  <th className="text-center py-3 px-4 font-semibold">Cross-Lingual</th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-850">
                {tableRows.map((item: any) => {
                  const gap = item.gapPct;
                  const gapCls =
                    gap == null
                      ? "text-gray-500"
                      : gap > 4
                        ? "text-red-600"
                        : gap > 3
                          ? "text-orange-600"
                          : "text-green-600";

                  return (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-slate-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: MODEL_COLORS[item.model as keyof typeof MODEL_COLORS],
                            }}
                          />
                          <span className="font-semibold">{item.model}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">{item.threshold}</td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/20 font-mono font-semibold text-blue-700 dark:text-blue-400">
                          {fmtPct(item.enVal)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded bg-green-50 dark:bg-green-950/20 font-mono font-semibold text-green-700 dark:text-green-400">
                          {fmtPct(item.viVal)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-semibold ${gapCls}`}>
                          {gap == null ? "—" : `-${gap.toFixed(1)}%`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        {isFiniteNumber(item.crossLingualScore)
                          ? item.crossLingualScore.toFixed(3)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 text-[13px] text-gray-500 dark:text-slate-400">
              Source: <span className="font-mono">{data?.baseDir}</span>{" "}
              <span className="mx-2">•</span>
              Generated:{" "}
              <span className="font-mono">
                {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}