import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

type RecallPoint = { k: number; baseline: number; advanced: number };
type RadarPoint = { metric: string; baseline: number; advanced: number };
type LanguagePoint = { language: string; baseline: number; advanced: number };

type ApiPayload = {
  ok: boolean;
  options?: {
    datasets: string[];
    taus: number[];
    languages: Array<"ALL" | "EN" | "VI">;
    models: string[];
  };
  recallComparison: RecallPoint[];
  radarComparison: RadarPoint[];
  languagePerformance: LanguagePoint[];
};

type ChartsProps = {
  endpoint?: string;
  titlePrefix?: string;
};

function labelClass() {
  return "text-[11px] text-gray-500 dark:text-slate-400";
}

export default function Charts({
  endpoint = "http://localhost:4000/model/model-comparison-charts",
  titlePrefix,
}: ChartsProps) {
  const [data, setData] = useState<ApiPayload | null>(null);

  const [dataset, setDataset] = useState<string>("all");
  const [tau, setTau] = useState<string>("all");
  const [lang, setLang] = useState<"ALL" | "EN" | "VI">("ALL");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const qs = new URLSearchParams();
        qs.set("dataset", dataset);
        qs.set("tau", tau);
        qs.set("lang", lang);

        const res = await fetch(`${endpoint}?${qs.toString()}`);
        const json = (await res.json()) as ApiPayload;

        if (!alive) return;
        if (res.ok && json?.ok) setData(json);
        else setData(null);
      } catch {
        if (!alive) return;
        setData(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [endpoint, dataset, tau, lang]);

  const datasetOptions = useMemo(() => {
    const list = data?.ok ? (data.options?.datasets ?? []) : [];
    return ["all", ...list];
  }, [data]);

  const tauOptions = useMemo(() => {
    const list = data?.ok ? (data.options?.taus ?? []).map(String) : [];
    return ["all", ...list];
  }, [data]);

  const headerTitle = useMemo(() => {
    const parts: string[] = [];
    if (titlePrefix) parts.push(titlePrefix);

    const ds = dataset === "all" ? "All datasets" : dataset;
    const t = tau === "all" ? "All τ" : `τ=${tau}`;
    const l = lang === "ALL" ? "All langs" : lang;

    parts.push(`${ds} · ${t} · ${l}`);
    return parts.join(" — ");
  }, [titlePrefix, dataset, tau, lang]);

  const recallComparison = data?.ok ? (data.recallComparison ?? []) : [];
  const radarComparison = data?.ok ? (data.radarComparison ?? []) : [];
  const languagePerformance = data?.ok ? (data.languagePerformance ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Row 1: Recall + Radar */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recall@K */}
        <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-gray-700 dark:text-slate-300">
              Recall@K Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recallComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="k"
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Top-K",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  domain={[0.7, 1.0]}
                  label={{
                    value: "Recall",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: 14,
                    marginBottom: -6,
                    fontSize: 12,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="MiniLM"
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="advanced"
                  stroke="#a855f7"
                  strokeWidth={2}
                  name="BGE-M3 + CE"
                  dot={{ fill: "#a855f7", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-gray-700 dark:text-slate-300">
              Multidimensional Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarComparison}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 1]}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Radar
                  name="MiniLM"
                  dataKey="baseline"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Radar
                  name="BGE-M3 + CE"
                  dataKey="advanced"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.2}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Lingual */}
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-gray-700 dark:text-slate-300">
            Cross-Lingual Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={languagePerformance}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.1}
              />
              <XAxis
                dataKey="language"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                domain={[0.7, 1.0]}
                label={{
                  value: "Recall@10",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                  fill: "#64748b",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="baseline" fill="#3b82f6" name="MiniLM" />
              <Bar dataKey="advanced" fill="#a855f7" name="BGE-M3 + CE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
