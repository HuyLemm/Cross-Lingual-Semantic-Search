"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { ShieldCheck } from "lucide-react";

import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:4000";

interface Props {
  quality: string; // threshold từ slider
}

type CrossRow = {
  model: string;
  totalQA: number;
  avgSimilarity: number;
  avgEntailment: number;
  verified: number;
  enVerified: number;
  viVerified: number;
};

type RadarRow = {
  metric: string;
  [key: string]: number | string;
};

type Payload = {
  crossModelComparison: CrossRow[];
  radarComparisonData: RadarRow[];
};

export default function CrossModelComparison({ quality }: Props) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // match với các controls hiện tại:
  const dataset = "all";
  const experiment = "all";

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("dataset", dataset);
    params.set("experiment", experiment);
    params.set("threshold", quality);
    return `${API_BASE}/qa-eval/cross-model?${params.toString()}`;
  }, [dataset, experiment, quality]);

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

        const json = (await res.json()) as Payload;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load cross-model data");
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

  const crossModelComparison = data?.crossModelComparison ?? [];
  const radarComparisonData = data?.radarComparisonData ?? [];

  const thLabel = Number(quality ?? 0.8).toFixed(2);

  return (
    <div className="border-t-2 border-gray-300 dark:border-slate-700 pt-8 mt-8">
      {/* ✅ header + badge */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          Cross-Model Comparison
        </h3>

        <Badge
          className="
            inline-flex items-center gap-1.5
            bg-emerald-50 text-emerald-700 border border-emerald-200
            dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40
            px-3 py-1 rounded-full text-sm font-semibold
            shadow-sm
          "
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified QA Only
          <span className="opacity-70">•</span>t ≥ {thLabel}
        </Badge>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Loading cross-model comparison...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="py-6 text-sm text-red-600 dark:text-red-400 break-all">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Grouped Bar Chart */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Model Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={crossModelComparison}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="model"
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                    <Bar
                      dataKey="verified"
                      fill="#a855f7"
                      name="Verified %"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="enVerified"
                      fill="#3b82f6"
                      name="EN Verified %"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="viVerified"
                      fill="#10b981"
                      name="VI Verified %"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Multidimensional Model Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarComparisonData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 1]}
                      tick={{ fontSize: 9, fill: "#6b7280" }}
                    />
                    <Radar
                      name="GPT-5.2"
                      dataKey="GPT-5.2"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="Gemini 2.5"
                      dataKey="Gemini 2.5"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="DeepSeek R1T2"
                      dataKey="DeepSeek R1T2"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.2}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Model Comparison Table */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Detailed Model Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden border border-gray-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        Model
                      </th>
                      <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        Total QA
                      </th>
                      <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        Avg Similarity
                      </th>
                      <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        Avg Entailment
                      </th>
                      <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        Verified %
                      </th>
                      <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        EN Verified %
                      </th>
                      <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                        VI Verified %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-850">
                    {crossModelComparison.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 dark:text-slate-100">
                            {row.model}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gray-900 dark:text-slate-100">
                          {row.totalQA}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-blue-700 dark:text-blue-400 font-semibold">
                          {row.avgSimilarity.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-green-700 dark:text-green-400 font-semibold">
                          {row.avgEntailment.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/20 font-mono text-xs font-semibold text-purple-700 dark:text-purple-400">
                            {row.verified.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gray-700 dark:text-slate-300 text-xs">
                          {row.enVerified.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gray-700 dark:text-slate-300 text-xs">
                          {row.viVerified.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
