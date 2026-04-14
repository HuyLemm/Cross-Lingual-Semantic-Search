"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Loader2 } from "lucide-react";
import { MODEL_COLORS } from "./option1.constants";

type ModelName = "DeepSeek" | "Gemini" | "GPT";
type MetricKey = "top1" | "top3" | "top5" | "top10";

type ScatterPoint = {
  x: number; // latency ms
  y: number; // metric 0..1 (selected Top-k)
  name: string;
  model: ModelName;
  language: "EN" | "VI";
  threshold: "0.7" | "0.8" | "All QAs";
  sourceFile?: string;
};

type LatencyApi = {
  generatedAt: string;
  baseDir: string;
  metric?: MetricKey;

  scatterDataByModel: Record<ModelName, ScatterPoint[]>;

  // aggregated per model
  efficiencyTable: Array<{
    model: ModelName;
    avgLatencyMs: number | null;
    metricValue: number | null; // ✅ selected metric avg
    efficiency: number | null;
    top1?: number | null; // fallback if backend older
  }>;

  counts?: { filesFound: number; parsedConfigs: number };
  warning?: string;
};

function isFiniteNumber(v: any): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function fmtPct(v: number | null | undefined) {
  if (!isFiniteNumber(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtMs(v: number | null | undefined) {
  if (!isFiniteNumber(v)) return "—";
  return `${Math.round(v)}ms`;
}

function fmtEff(v: number | null | undefined) {
  if (!isFiniteNumber(v)) return "—";
  return v.toFixed(3);
}

function prettyMetric(m: MetricKey) {
  if (m === "top1") return "Top-1";
  if (m === "top3") return "Top-3";
  if (m === "top5") return "Top-5";
  return "Top-10";
}

export default function TabLatency() {
  const [data, setData] = useState<LatencyApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [metric, setMetric] = useState<MetricKey>("top1");

  // ✅ prevent scroll “jump to top” when switching metric
  const scrollYRef = useRef(0);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

  function handleSetMetric(m: MetricKey) {
    scrollYRef.current = window.scrollY;
    setMetric(m);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const url = `${API_BASE}/evaluation/option1/latency?metric=${metric}`;
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} ${t}`.trim());
        }

        const json = (await res.json()) as LatencyApi;
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
  }, [API_BASE, metric]);

  // restore scroll after update completes
  useEffect(() => {
    if (!loading) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: scrollYRef.current, behavior: "auto" });
      });
    }
  }, [loading, metric]);

  const scatterDataByModel = data?.scatterDataByModel ?? {
    DeepSeek: [],
    Gemini: [],
    GPT: [],
  };

  const efficiencyTable = data?.efficiencyTable ?? [];

  const bestEfficiencyModel = useMemo(() => {
    let best: { model: ModelName; efficiency: number } | null = null;
    for (const r of efficiencyTable) {
      if (!isFiniteNumber(r.efficiency)) continue;
      if (!best || r.efficiency > best.efficiency)
        best = { model: r.model, efficiency: r.efficiency };
    }
    return best?.model ?? null;
  }, [efficiencyTable]);

  // dynamic Y domain
  const yDomain = useMemo(() => {
    const all = [
      ...scatterDataByModel.DeepSeek,
      ...scatterDataByModel.Gemini,
      ...scatterDataByModel.GPT,
    ]
      .map((p) => p.y)
      .filter(isFiniteNumber);

    if (!all.length) return [0, 1] as const;

    const min = Math.max(0, Math.min(...all) - 0.03);
    const max = Math.min(1, Math.max(...all) + 0.03);
    return [min, max] as const;
  }, [scatterDataByModel]);

  if (errorMsg) {
    return (
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Failed to load latency tab
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-red-600 whitespace-pre-wrap">
          {errorMsg}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* ✅ overlay loading (keeps layout, avoids scroll jump) */}
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-950/50 backdrop-blur-[1px] rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
            <Loader2 className="w-5 h-5 animate-spin" />
            Updating...
          </div>
        </div>
      ) : null}

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

      {/* Metric selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-slate-400 font-semibold">
            Metric:
          </span>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-sm">
            {(["top1", "top3", "top5", "top10"] as const).map((m) => {
              const active = metric === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSetMetric(m)}
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
        </div>

        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold
          bg-amber-100 text-amber-800 border border-amber-200
          dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/40"
        >
          {prettyMetric(metric)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Scatter */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Latency vs Accuracy Scatter Plot ({prettyMetric(metric)})
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Each point = (model, language, threshold). Lower-right is optimal.
            </p>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />

                <XAxis
                  dataKey="x"
                  name="Latency"
                  unit="ms"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Latency (ms)",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 11,
                  }}
                />

                <YAxis
                  dataKey="y"
                  name={prettyMetric(metric)}
                  domain={yDomain as any}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  label={{
                    value: `${prettyMetric(metric)} Accuracy`,
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d: any = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2 shadow-lg">
                          <p className="text-xs font-semibold">{d.name}</p>
                          <p className="text-xs">Latency: {d.x}ms</p>
                          <p className="text-xs">
                            {prettyMetric(metric)}: {(d.y * 100).toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={28} // giữ chỗ cho legend, tránh đè label
                  wrapperStyle={{ fontSize: "11px", paddingTop: 20 }}
                  iconSize={10}
                />

                <Scatter
                  name="DeepSeek"
                  data={scatterDataByModel.DeepSeek}
                  fill={MODEL_COLORS.DeepSeek}
                  shape="circle"
                />
                <Scatter
                  name="Gemini"
                  data={scatterDataByModel.Gemini}
                  fill={MODEL_COLORS.Gemini}
                  shape="triangle"
                />
                <Scatter
                  name="GPT"
                  data={scatterDataByModel.GPT}
                  fill={MODEL_COLORS.GPT}
                  shape="diamond"
                />
              </ScatterChart>
            </ResponsiveContainer>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center italic">
              Different shapes indicate different models • Lower-right is
              optimal (low latency, high accuracy)
            </p>
          </CardContent>
        </Card>

        {/* Efficiency Table */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Efficiency Score Table ({prettyMetric(metric)})
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Aggregated per model across all (language, threshold).
            </p>
          </CardHeader>

          <CardContent>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Model</th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Avg Latency
                  </th>
                  <th className="text-center py-3 px-4 font-semibold">
                    {prettyMetric(metric)}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Efficiency
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-850">
                {efficiencyTable.map((row) => {
                  const isBest = bestEfficiencyModel === row.model;
                  const metricVal = row.metricValue ?? row.top1 ?? null;

                  return (
                    <tr
                      key={row.model}
                      className={[
                        "border-t border-gray-100 dark:border-slate-800",
                        isBest ? "bg-green-50/30 dark:bg-green-950/10" : "",
                      ].join(" ")}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: MODEL_COLORS[row.model] }}
                          />
                          <span className="font-semibold">{row.model}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        {fmtMs(row.avgLatencyMs)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {fmtPct(metricVal)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        <span
                          className={
                            isBest
                              ? "text-green-600 font-bold"
                              : "text-blue-600"
                          }
                        >
                          {fmtEff(row.efficiency)}
                          {isBest ? " ⭐" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 italic">
              Efficiency Score = ({prettyMetric(metric)} Accuracy) / (Latency in
              ms) × 100
            </p>

            <div className="mt-3 text-[13px] text-gray-500 dark:text-slate-400">
              Source: <span className="font-mono">{data?.baseDir ?? "—"}</span>{" "}
              <span className="mx-2">•</span>
              Generated:{" "}
              <span className="font-mono">
                {data?.generatedAt
                  ? new Date(data.generatedAt).toLocaleString()
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
