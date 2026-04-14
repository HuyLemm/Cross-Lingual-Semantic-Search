"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Loader2 } from "lucide-react";

type TableRow = {
  model: string;
  language: "EN" | "VI";
  threshold: "0.7" | "0.8" | "All QAs";

  top1: number;
  top3: number;
  top5: number;
  top10: number;

  latencyAvgMs: number | null;
  latencyP50Ms: number | null;
  latencyP90Ms: number | null;
  latencyP95Ms: number | null;

  throughputQps: number | null;
};

type TablesApi = {
  generatedAt: string;
  baseDir: string;
  rows: TableRow[];
  warning?: string;
};

function fmtPct(v: number | null | undefined) {
  if (typeof v !== "number") return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtMs(v: number | null | undefined) {
  if (typeof v !== "number") return "—";
  return `${Math.round(v)}ms`;
}

function fmtQps(v: number | null | undefined) {
  if (typeof v !== "number") return "—";
  return v.toFixed(2);
}

export default function TabTables() {
  const [data, setData] = useState<TablesApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${API_BASE}/evaluation/option1/tables`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} ${t}`);
        }

        const json = await res.json();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm text-gray-600 dark:text-slate-400">
            Loading complete metrics table...
          </span>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-red-600 whitespace-pre-wrap">
          {errorMsg}
        </CardContent>
      </Card>
    );
  }

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Complete Metrics Table (All Configurations)
          </CardTitle>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Accuracy + Latency distribution (Avg / P50 / P90 / P95)
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto max-h-[650px]">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-3 font-semibold">Model</th>
                  <th className="text-left py-3 px-3 font-semibold">Lang</th>
                  <th className="text-left py-3 px-3 font-semibold">Threshold</th>

                  <th className="text-center py-3 px-3 font-semibold">Top-1</th>
                  <th className="text-center py-3 px-3 font-semibold">Top-3</th>
                  <th className="text-center py-3 px-3 font-semibold">Top-5</th>
                  <th className="text-center py-3 px-3 font-semibold">Top-10</th>

                  <th className="text-center py-3 px-3 font-semibold">Avg</th>
                  <th className="text-center py-3 px-3 font-semibold">P50</th>
                  <th className="text-center py-3 px-3 font-semibold">P90</th>
                  <th className="text-center py-3 px-3 font-semibold">P95</th>
                  <th className="text-center py-3 px-3 font-semibold">Throughput</th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-850">
                {rows.map((config, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-2 px-3 font-semibold">{config.model}</td>
                    <td className="py-2 px-3">{config.language}</td>
                    <td className="py-2 px-3 font-mono">{config.threshold}</td>

                    <td className="py-2 px-3 text-center font-mono font-semibold text-blue-700">
                      {fmtPct(config.top1)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">{fmtPct(config.top3)}</td>
                    <td className="py-2 px-3 text-center font-mono">{fmtPct(config.top5)}</td>
                    <td className="py-2 px-3 text-center font-mono">{fmtPct(config.top10)}</td>

                    <td className="py-2 px-3 text-center font-mono">{fmtMs(config.latencyAvgMs)}</td>
                    <td className="py-2 px-3 text-center font-mono text-xs">{fmtMs(config.latencyP50Ms)}</td>
                    <td className="py-2 px-3 text-center font-mono text-xs">{fmtMs(config.latencyP90Ms)}</td>
                    <td className="py-2 px-3 text-center font-mono text-xs">{fmtMs(config.latencyP95Ms)}</td>

                    <td className="py-2 px-3 text-center font-mono text-xs">
                      {fmtQps(config.throughputQps)} q/s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-slate-400">
            Source: <span className="font-mono">{data?.baseDir}</span> • Generated:{" "}
            <span className="font-mono">
              {data?.generatedAt
                ? new Date(data.generatedAt).toLocaleString()
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}