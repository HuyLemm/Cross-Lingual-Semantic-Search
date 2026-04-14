import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Trophy, Zap, Target, Loader2 } from "lucide-react";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { MODEL_COLORS } from "./option1.constants";

type ModelName = "DeepSeek" | "Gemini" | "GPT";
type Lang = "EN" | "VI";
type Threshold = "All QAs" | "0.7" | "0.8";
type MetricKey = "top1" | "top3" | "top5" | "top10";

type SummaryApi = {
  generatedAt: string;
  baseDir: string;
  availableModels: ModelName[];

  allConfigs: Array<{
    id: string;
    model: ModelName;
    language: Lang;
    threshold: Threshold;

    top1: number;
    top3?: number;
    top5?: number;
    top10: number;

    latency: number; // avgMs
    datasetTotal: number;
  }>;

  bestTop1?: { value: number | null; config: string | null };
  bestTop3?: { value: number | null; config: string | null };
  bestTop5?: { value: number | null; config: string | null };
  bestTop10?: { value: number | null; config: string | null };
  fastestLatency?: { valueMs: number | null; config: string | null };

  radarData?: Array<Record<string, any>>;
  warning?: string;
};

function isFiniteNumber(v: any): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function formatPct(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function formatMs(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${Math.round(v)}ms`;
}

function prettyThreshold(t: Threshold | "all") {
  if (t === "all") return "All";
  if (t === "All QAs") return "All QAs";
  return t;
}

function prettyMetric(m: MetricKey) {
  if (m === "top1") return "Top-1";
  if (m === "top3") return "Top-3";
  if (m === "top5") return "Top-5";
  return "Top-10";
}

function computeBest(
  configs: SummaryApi["allConfigs"],
  metric: MetricKey,
): { value: number | null; config: string | null } {
  let bestV = -Infinity;
  let bestC: string | null = null;

  for (const c of configs) {
    const v = (c as any)[metric];
    if (!isFiniteNumber(v)) continue;

    if (v > bestV) {
      bestV = v;
      bestC = `${c.model} ${c.language} ${c.threshold}`;
    }
  }

  if (bestV === -Infinity) return { value: null, config: null };
  return { value: bestV, config: bestC };
}

function computeFastest(configs: SummaryApi["allConfigs"]): {
  valueMs: number | null;
  config: string | null;
} {
  let bestV = Infinity;
  let bestC: string | null = null;

  for (const c of configs) {
    if (!isFiniteNumber(c.latency)) continue;
    if (c.latency < bestV) {
      bestV = c.latency;
      bestC = `${c.model} ${c.language} ${c.threshold}`;
    }
  }

  if (bestV === Infinity) return { valueMs: null, config: null };
  return { valueMs: bestV, config: bestC };
}

export default function TabSummary() {
  const [data, setData] = useState<SummaryApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [thresholdFilter, setThresholdFilter] = useState<Threshold | "all">(
    "all",
  );
  const [metricFilter, setMetricFilter] = useState<MetricKey>("top1");

  // ✅ Radar language filter
  const [radarLangFilter, setRadarLangFilter] = useState<Lang | "all">("all");

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${API_BASE}/evaluation/option1/summary`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} ${t}`.trim());
        }

        const json = (await res.json()) as SummaryApi;
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

  const availableModels = data?.availableModels ?? [];
  const allConfigs = data?.allConfigs ?? [];

  const kpi = useMemo(() => {
    if (!data) return null;

    const bestTop1 = data.bestTop1 ?? computeBest(allConfigs, "top1");
    const bestTop3 = data.bestTop3 ?? computeBest(allConfigs, "top3");
    const bestTop5 = data.bestTop5 ?? computeBest(allConfigs, "top5");
    const bestTop10 = data.bestTop10 ?? computeBest(allConfigs, "top10");
    const fastestLatency = data.fastestLatency ?? computeFastest(allConfigs);

    return { bestTop1, bestTop3, bestTop5, bestTop10, fastestLatency };
  }, [data, allConfigs]);

  const barDataAll = useMemo(() => {
    return allConfigs.map((c) => ({
      ...c,
      label: `${c.model}-${c.language}-${c.threshold === "All QAs" ? "all" : c.threshold}`,
      top3: isFiniteNumber(c.top3) ? c.top3 : null,
      top5: isFiniteNumber(c.top5) ? c.top5 : null,
    }));
  }, [allConfigs]);

  const barDataFiltered = useMemo(() => {
    const th = thresholdFilter;
    const arr =
      th === "all" ? barDataAll : barDataAll.filter((c) => c.threshold === th);

    const orderModel: Record<ModelName, number> = {
      DeepSeek: 1,
      Gemini: 2,
      GPT: 3,
    };
    const orderLang: Record<Lang, number> = { EN: 1, VI: 2 };
    const orderTh: Record<Threshold, number> = {
      "All QAs": 3,
      "0.7": 1,
      "0.8": 2,
    };

    return [...arr].sort((a, b) => {
      const dm = orderModel[a.model] - orderModel[b.model];
      if (dm) return dm;
      const dl = orderLang[a.language] - orderLang[b.language];
      if (dl) return dl;
      return orderTh[a.threshold] - orderTh[b.threshold];
    });
  }, [barDataAll, thresholdFilter]);

  const barDataProjected = useMemo(() => {
    return barDataFiltered.map((c) => {
      const raw = (c as any)[metricFilter];
      const metricValue = isFiniteNumber(raw) ? raw : 0;
      return { ...c, metricValue };
    });
  }, [barDataFiltered, metricFilter]);

  // ✅ Apply language filter for Radar only
  const radarConfigs = useMemo(() => {
    if (radarLangFilter === "all") return allConfigs;
    return allConfigs.filter((c) => c.language === radarLangFilter);
  }, [allConfigs, radarLangFilter]);

  // ✅ Radar should NOT mix latency(ms) with accuracy. Radar = accuracy only.
  const radarData = useMemo(() => {
    if (!radarConfigs.length) return [];

    const metrics = ["Top-1", "Top-3", "Top-5", "Top-10"] as const;

    function avgMetric(model: ModelName, key: MetricKey) {
      const vals = radarConfigs
        .filter((c) => c.model === model)
        .map((c) => (c as any)[key])
        .filter(isFiniteNumber);
      if (!vals.length) return null;
      return vals.reduce((s, x) => s + x, 0) / vals.length;
    }

    return metrics.map((metric) => {
      const row: any = { metric, DeepSeek: 0, Gemini: 0, GPT: 0 };

      if (metric === "Top-1") {
        row.DeepSeek = avgMetric("DeepSeek", "top1") ?? 0;
        row.Gemini = avgMetric("Gemini", "top1") ?? 0;
        row.GPT = avgMetric("GPT", "top1") ?? 0;
      } else if (metric === "Top-3") {
        row.DeepSeek = avgMetric("DeepSeek", "top3") ?? 0;
        row.Gemini = avgMetric("Gemini", "top3") ?? 0;
        row.GPT = avgMetric("GPT", "top3") ?? 0;
      } else if (metric === "Top-5") {
        row.DeepSeek = avgMetric("DeepSeek", "top5") ?? 0;
        row.Gemini = avgMetric("Gemini", "top5") ?? 0;
        row.GPT = avgMetric("GPT", "top5") ?? 0;
      } else if (metric === "Top-10") {
        row.DeepSeek = avgMetric("DeepSeek", "top10") ?? 0;
        row.Gemini = avgMetric("Gemini", "top10") ?? 0;
        row.GPT = avgMetric("GPT", "top10") ?? 0;
      }

      row.DeepSeek = isFiniteNumber(row.DeepSeek) ? row.DeepSeek : 0;
      row.Gemini = isFiniteNumber(row.Gemini) ? row.Gemini : 0;
      row.GPT = isFiniteNumber(row.GPT) ? row.GPT : 0;

      return row;
    });
  }, [radarConfigs]);

  // ✅ NEW: show real avg latency numbers (ms) below Radar
  const radarAvgLatency = useMemo(() => {
    const result: Record<ModelName, number | null> = {
      DeepSeek: null,
      Gemini: null,
      GPT: null,
    };

    for (const m of ["DeepSeek", "Gemini", "GPT"] as const) {
      const vals = radarConfigs
        .filter((c) => c.model === m)
        .map((c) => c.latency)
        .filter(isFiniteNumber)
        .filter((x) => x > 0);

      if (!vals.length) {
        result[m] = null;
        continue;
      }

      result[m] = vals.reduce((s, x) => s + x, 0) / vals.length;
    }

    return result;
  }, [radarConfigs]);

  const sortedRanking = useMemo(() => {
    return [...allConfigs].sort((a, b) => {
      const d1 = (b.top1 ?? 0) - (a.top1 ?? 0);
      if (d1) return d1;

      const d10 = (b.top10 ?? 0) - (a.top10 ?? 0);
      if (d10) return d10;

      const la = isFiniteNumber(a.latency)
        ? a.latency
        : Number.POSITIVE_INFINITY;
      const lb = isFiniteNumber(b.latency)
        ? b.latency
        : Number.POSITIVE_INFINITY;
      return la - lb;
    });
  }, [allConfigs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm text-gray-600 dark:text-slate-400">
            Loading summary
          </span>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="space-y-6">
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Failed to load summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-red-600 whitespace-pre-wrap">
            {errorMsg}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !kpi) return null;

  const radarScopeLabel =
    radarLangFilter === "all"
      ? "All"
      : radarLangFilter === "EN"
        ? "English only"
        : "Vietnamese only";

  const RadarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const metric = payload[0]?.payload?.metric;

    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2 shadow-lg">
        <p className="text-xs font-semibold">{metric}</p>
        <div className="mt-1 space-y-0.5">
          {payload.map((p: any) => (
            <div
              key={p.name}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-gray-600 dark:text-slate-400">
                {p.name}
              </span>
              <span className="font-mono font-semibold">
                {formatPct(p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {data.warning ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="py-3 text-xs text-amber-900 dark:text-amber-200">
            {data.warning}
            <div className="mt-1 text-[13px] opacity-80">
              baseDir: <span className="font-mono">{data.baseDir}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card className="border-gray-200 dark:border-slate-700 overflow-hidden">
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #60a5fa, #2563eb)" }}
          />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Best Top-1
              </p>
              <Trophy className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {formatPct(kpi.bestTop1.value)}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {kpi.bestTop1.config ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-slate-700 overflow-hidden">
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #a78bfa, #7c3aed)" }}
          />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Best Top-3
              </p>
              <Target className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {formatPct(kpi.bestTop3.value)}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {kpi.bestTop3.config ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-slate-700 overflow-hidden">
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #34d399, #059669)" }}
          />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Best Top-5
              </p>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {formatPct(kpi.bestTop5.value)}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {kpi.bestTop5.config ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-slate-700 overflow-hidden">
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
          />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Best Top-10
              </p>
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {formatPct(kpi.bestTop10.value)}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {kpi.bestTop10.config ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-slate-700 overflow-hidden">
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #fb7185, #e11d48)" }}
          />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Fastest Latency
              </p>
              <Zap className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {formatMs(kpi.fastestLatency.valueMs)}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {kpi.fastestLatency.config ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Radar */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Cross-Model Performance Comparison
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Radar shows accuracy only. Latency shown as real ms below.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <span
                  className="
      inline-flex items-center
      rounded-full
      px-3 py-1
      text-[13px] font-semibold
      bg-indigo-100
      text-indigo-800
      border border-indigo-200
      dark:bg-indigo-950/40
      dark:text-indigo-200
      dark:border-indigo-900/40
    "
                >
                  Language: {radarScopeLabel}
                </span>
              </div>
            </div>

            {/* Language segmented */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-sm">
                {(["all", "EN", "VI"] as const).map((l) => {
                  const active = radarLangFilter === l;
                  const label =
                    l === "all" ? "All" : l === "EN" ? "English" : "Vietnamese";
                  return (
                    <button
                      key={l}
                      onClick={() => setRadarLangFilter(l)}
                      className={[
                        "px-3 py-1 text-[13px] rounded-lg transition font-semibold",
                        active
                          ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <Badge variant="outline" className="text-[13px]">
                Avg Latency (ms) is displayed below
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {radarConfigs.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-slate-400 py-6">
                No configurations match the selected language filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 1]}
                    tick={{ fontSize: 9, fill: "#6b7280" }}
                  />

                  {availableModels.includes("DeepSeek") && (
                    <Radar
                      name="DeepSeek"
                      dataKey="DeepSeek"
                      stroke={MODEL_COLORS.DeepSeek}
                      fill={MODEL_COLORS.DeepSeek}
                      fillOpacity={0.22}
                      strokeWidth={2}
                    />
                  )}
                  {availableModels.includes("Gemini") && (
                    <Radar
                      name="Gemini"
                      dataKey="Gemini"
                      stroke={MODEL_COLORS.Gemini}
                      fill={MODEL_COLORS.Gemini}
                      fillOpacity={0.22}
                      strokeWidth={2}
                    />
                  )}
                  {availableModels.includes("GPT") && (
                    <Radar
                      name="GPT"
                      dataKey="GPT"
                      stroke={MODEL_COLORS.GPT}
                      fill={MODEL_COLORS.GPT}
                      fillOpacity={0.22}
                      strokeWidth={2}
                    />
                  )}

                  <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {/* ✅ Real latency numbers */}
            <div className="mt-3 rounded-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200">
                Avg Latency (ms) by model ({radarScopeLabel})
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {(["DeepSeek", "Gemini", "GPT"] as const)
                  .filter((m) => availableModels.includes(m))
                  .map((m) => (
                    <Badge key={m} variant="secondary" className="text-[13px]">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: MODEL_COLORS[m] }}
                        />
                        {m}:{" "}
                        <span className="font-mono">
                          {formatMs(radarAvgLatency[m])}
                        </span>
                      </span>
                    </Badge>
                  ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center italic">
              Radar uses model-wise averages across {radarScopeLabel}.
            </p>
          </CardContent>
        </Card>

        {/* Bar + Filters (giữ nguyên) */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Metric Across Configurations
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Filter by threshold, then choose Top-k metric to compare.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
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

            {/* Threshold segmented */}
            <div className="mt-3 flex items-center justify-between gap-6 flex-nowrap">
              {/* LEFT: Threshold */}
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-sm shrink-0">
                {(["all", "0.7", "0.8", "All QAs"] as const).map((t) => {
                  const active = thresholdFilter === t;
                  return (
                    <button
                      key={t}
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

              {/* RIGHT: Metric */}
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 shadow-sm shrink-0">
                {(["top1", "top3", "top5", "top10"] as const).map((m) => {
                  const active = metricFilter === m;
                  return (
                    <button
                      key={m}
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
            </div>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={barDataProjected}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  interval={0}
                  height={85}
                  tick={{ fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  tickFormatter={(s: string) => {
                    // DeepSeek-EN-0.7 -> Deep EN 0.7
                    const parts = s.split("-");
                    const model =
                      parts[0] === "DeepSeek"
                        ? "Deep"
                        : parts[0] === "Gemini"
                          ? "Gem"
                          : "GPT";
                    return `${model} ${parts[1]} ${parts[2]}`;
                  }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d: any = payload[0].payload;
                      const metricVal = (d as any)[metricFilter];

                      return (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2 shadow-lg">
                          <p className="text-xs font-semibold">
                            {d.model} - {d.language} ({d.threshold})
                          </p>
                          <p className="text-xs mt-1">
                            <span className="text-gray-600 dark:text-slate-400">
                              {prettyMetric(metricFilter)}:
                            </span>{" "}
                            <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                              {formatPct(
                                isFiniteNumber(metricVal) ? metricVal : null,
                              )}
                            </span>
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            Top-10: {formatPct(d.top10)} • Avg latency:{" "}
                            {formatMs(d.latency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />
                <Bar dataKey="metricValue" radius={[6, 6, 0, 0]}>
                  {barDataProjected.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        MODEL_COLORS[entry.model as keyof typeof MODEL_COLORS]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-4 mt-3">
              {(["DeepSeek", "Gemini", "GPT"] as const)
                .filter((m) => availableModels.includes(m))
                .map((m) => (
                  <div key={m} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: MODEL_COLORS[m] }}
                    />
                    <span className="text-xs text-gray-600 dark:text-slate-400">
                      {m}
                    </span>
                  </div>
                ))}
            </div>

            {metricFilter !== "top1" && metricFilter !== "top10" ? (
              <p className="mt-2 text-[13px] text-gray-500 dark:text-slate-400">
                If {prettyMetric(metricFilter)} shows “—” in tooltip/table,
                backend may not provide that metric yet. Bar chart renders
                missing values as 0 for stability.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Ranking Table (giữ nguyên) */}
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Overall Configuration Ranking
          </CardTitle>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Sorted by Top-1 (desc), then Top-10 (desc), then Latency (asc).
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto max-h-[440px] rounded-lg border border-gray-100 dark:border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-3 font-semibold">Rank</th>
                  <th className="text-left py-3 px-3 font-semibold">Model</th>
                  <th className="text-left py-3 px-3 font-semibold">
                    Language
                  </th>
                  <th className="text-left py-3 px-3 font-semibold">
                    Threshold
                  </th>
                  <th className="text-center py-3 px-3 font-semibold">Top-1</th>
                  <th className="text-center py-3 px-3 font-semibold">Top-3</th>
                  <th className="text-center py-3 px-3 font-semibold">Top-5</th>
                  <th className="text-center py-3 px-3 font-semibold">
                    Top-10
                  </th>
                  <th className="text-center py-3 px-3 font-semibold">
                    Latency
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-850 text-[13px]">
                {sortedRanking.map((cfg, idx) => (
                  <tr
                    key={cfg.id}
                    className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className={[
                          "text-[13px]",
                          idx === 0
                            ? "border-amber-500 text-amber-700 font-semibold"
                            : "",
                          idx === 1
                            ? "border-slate-400 text-slate-700 dark:text-slate-200"
                            : "",
                          idx === 2
                            ? "border-orange-400 text-orange-700 font-semibold"
                            : "",
                        ].join(" ")}
                      >
                        #{idx + 1}
                      </Badge>
                    </td>

                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              MODEL_COLORS[
                                cfg.model as keyof typeof MODEL_COLORS
                              ],
                          }}
                        />
                        <span className="font-semibold">{cfg.model}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <Badge variant="outline">{cfg.language}</Badge>
                    </td>

                    <td className="py-2 px-3 font-mono">{cfg.threshold}</td>

                    <td className="py-2 px-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">
                      {formatPct(cfg.top1)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">
                      {formatPct(isFiniteNumber(cfg.top3) ? cfg.top3 : null)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">
                      {formatPct(isFiniteNumber(cfg.top5) ? cfg.top5 : null)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">
                      {formatPct(cfg.top10)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {formatMs(cfg.latency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[13px] text-gray-500 dark:text-slate-400">
            Source: <span className="font-mono">{data.baseDir}</span>{" "}
            <span className="mx-2">•</span>
            Generated:{" "}
            <span className="font-mono">
              {new Date(data.generatedAt).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
