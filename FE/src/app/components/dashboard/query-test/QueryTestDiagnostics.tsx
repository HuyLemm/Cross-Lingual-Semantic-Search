import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { QueryRow } from "./QueryTest.constants";

type Mode = "performance" | "failures";

function toNum(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fmtPct(v: number, digits = 0) {
  return `${(v * 100).toFixed(digits)}%`;
}

function SafeFixed({ v, digits }: { v: any; digits: number }) {
  const n = toNum(v, NaN);
  if (!Number.isFinite(n)) return <span className="text-gray-400">—</span>;
  return <>{n.toFixed(digits)}</>;
}

function classifyErrorType(r: any) {
  const type = String(r?.type || "").toLowerCase();

  if (type.includes("single word") || type.includes("keyword style")) return "Keyword bias";
  if (type.includes("cross-language")) return "Translation issue";
  if (type.includes("statement") || type.includes("negative") || type.includes("question")) return "Semantic mismatch";
  return "Embedding limitation";
}

function EngineBadge({ engine }: { engine?: string }) {
  const e = String(engine || "UNKNOWN").toUpperCase();
  const cls =
    e === "LLM"
      ? "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300"
      : e === "BGE"
      ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
      : "border-gray-300 text-gray-700 dark:border-slate-600 dark:text-slate-300";

  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {e}
    </Badge>
  );
}

function buildDistribution(values: number[], bins: { min: number; max: number; label: string }[]) {
  const out = bins.map((b) => ({ range: b.label, count: 0 }));
  for (const v of values) {
    for (let i = 0; i < bins.length; i++) {
      const b = bins[i];
      const isLast = i === bins.length - 1;
      if ((v >= b.min && v < b.max) || (isLast && v >= b.min && v <= b.max)) {
        out[i].count += 1;
        break;
      }
    }
  }
  return out;
}

export function QueryTestDiagnostics(props: {
  mode: Mode;
  rows: QueryRow[];
}) {
  const { mode, rows } = props;

  // Filters (optional but useful for diagnostics consistency)
  const [engineFilter, setEngineFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const engines = useMemo(() => {
    const s = new Set((rows || []).map((r: any) => String(r.engine || "UNKNOWN").toUpperCase()));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : [];
    return arr.filter((r: any) => {
      const engine = String(r.engine || "UNKNOWN").toUpperCase();
      const lang = String(r.language || "EN").toUpperCase();
      const status = String(r.status || "");

      if (engineFilter !== "all" && engine !== engineFilter) return false;
      if (languageFilter !== "all" && lang !== languageFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;

      return true;
    });
  }, [rows, engineFilter, languageFilter, statusFilter]);

  // ===== PERFORMANCE COMPUTATION (from rows) =====
  const perf = useMemo(() => {
    const arr = filteredRows;

    const total = arr.length || 1;

    const avgRecall10 = arr.length
      ? arr.reduce((s: number, r: any) => s + toNum(r.recall10, 0), 0) / arr.length
      : 0;

    const avgMRR = arr.length
      ? arr.reduce((s: number, r: any) => s + toNum(r.mrr, 0), 0) / arr.length
      : 0;

    const avgSimilarity = arr.length
      ? arr.reduce((s: number, r: any) => s + toNum(r.similarity, 0), 0) / arr.length
      : 0;

    // recall@K from hit@k if present
    const ks = [1, 3, 5, 10];
    const recallAtK = ks.map((k) => {
      const key = `hit@${k}`;
      const hitSum = arr.reduce((s: number, r: any) => s + toNum(r[key], 0), 0);
      return { k, recall: hitSum / total };
    });

    // mrr distribution from computed mrr
    const mrrValues = arr.map((r: any) => toNum(r.mrr, 0));
    const simValues = arr.map((r: any) => toNum(r.similarity, 0));

    const mrrDistribution = buildDistribution(mrrValues, [
      { min: 0.0, max: 0.2, label: "0.0-0.2" },
      { min: 0.2, max: 0.4, label: "0.2-0.4" },
      { min: 0.4, max: 0.6, label: "0.4-0.6" },
      { min: 0.6, max: 0.8, label: "0.6-0.8" },
      { min: 0.8, max: 1.0, label: "0.8-1.0" },
    ]);

    const similarityDistribution = buildDistribution(simValues, [
      { min: 0.0, max: 0.5, label: "0.0-0.5" },
      { min: 0.5, max: 0.6, label: "0.5-0.6" },
      { min: 0.6, max: 0.7, label: "0.6-0.7" },
      { min: 0.7, max: 0.8, label: "0.7-0.8" },
      { min: 0.8, max: 0.9, label: "0.8-0.9" },
      { min: 0.9, max: 1.0, label: "0.9-1.0" },
    ]);

    return {
      avgRecall10,
      avgMRR,
      avgSimilarity,
      recallAtK,
      mrrDistribution,
      similarityDistribution,
    };
  }, [filteredRows]);

  // ===== FAILURES (from rows) =====
  const failures = useMemo(() => {
    return filteredRows
      .filter((r: any) => String(r.status) === "failed")
      .map((r: any) => ({
        id: String(r.id),
        engine: String(r.engine || "UNKNOWN").toUpperCase(),
        query: String(r.query || ""),
        type: String(r.type || "Unknown"),
        language: String(r.language || "EN"),
        expected: String(r.expected_context || ""),
        rank: toNum(r.rank, 0),
        similarity: toNum(r.similarity, 0),
        latency_ms: toNum(r.latency_ms, NaN),
        errorType: classifyErrorType(r),
      }));
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Diagnostics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Engine:
              </Label>
              <Select value={engineFilter} onValueChange={setEngineFilter}>
                <SelectTrigger className="w-[160px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engines</SelectItem>
                  {engines.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Language:
              </Label>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="VI">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Status:
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-xs text-gray-600 dark:text-slate-400">
              Rows matched: <span className="font-mono">{filteredRows.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === "performance" ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                    Avg Recall@10
                  </p>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                  {perf.avgRecall10.toFixed(3)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                    Avg MRR
                  </p>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                  {perf.avgMRR.toFixed(3)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                    Avg Similarity
                  </p>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">
                  {perf.avgSimilarity.toFixed(3)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Recall@K Curve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={perf.recallAtK}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => fmtPct(toNum(v, 0), 1)} />
                    <Line type="monotone" dataKey="recall" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  MRR Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={perf.mrrDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Similarity Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={perf.similarityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // ===== FAILURES MODE =====
        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                Failed Queries ({failures.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold">Engine</th>
                      <th className="text-left py-3 px-3 font-semibold">Query</th>
                      <th className="text-left py-3 px-3 font-semibold">Query Type</th>
                      <th className="text-center py-3 px-3 font-semibold">Language</th>
                      <th className="text-left py-3 px-3 font-semibold">Expected</th>
                      <th className="text-center py-3 px-3 font-semibold">Rank</th>
                      <th className="text-center py-3 px-3 font-semibold">Similarity</th>
                      <th className="text-center py-3 px-3 font-semibold">Latency (ms)</th>
                      <th className="text-left py-3 px-3 font-semibold">Error Type</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white dark:bg-slate-850">
                    {failures.map((q, idx) => (
                      <tr
                        key={`${q.id}-${idx}`}
                        className="border-t border-gray-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/10"
                      >
                        <td className="py-3 px-3">
                          <EngineBadge engine={q.engine} />
                        </td>

                        <td className="py-3 px-3 text-gray-900 dark:text-slate-100 font-medium">
                          {q.query}
                        </td>

                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-xs border-gray-300 dark:border-slate-600">
                            {q.type}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant="outline"
                            className="text-xs border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400"
                          >
                            {q.language}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-gray-700 dark:text-slate-300">
                          {q.expected || "—"}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-red-600 dark:text-red-500 font-semibold">
                          #{q.rank}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-orange-700 dark:text-orange-400">
                          <SafeFixed v={q.similarity} digits={2} />
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          <SafeFixed v={q.latency_ms} digits={0} />
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            className={
                              q.errorType === "Keyword bias"
                                ? "bg-orange-600 text-white text-xs"
                                : q.errorType === "Semantic mismatch"
                                ? "bg-red-600 text-white text-xs"
                                : q.errorType === "Translation issue"
                                ? "bg-yellow-600 text-white text-xs"
                                : q.errorType === "Embedding limitation"
                                ? "bg-purple-600 text-white text-xs"
                                : "bg-blue-600 text-white text-xs"
                            }
                          >
                            {q.errorType}
                          </Badge>
                        </td>
                      </tr>
                    ))}

                    {!failures.length && (
                      <tr className="border-t border-gray-100 dark:border-slate-800">
                        <td colSpan={9} className="py-4 px-3 text-center text-gray-500">
                          No failed queries for current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-slate-700 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Error Analysis Summary (Heuristic)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Keyword bias:</strong> Queries thiếu ngữ cảnh (single/keyword-style) dễ mơ hồ → rank thấp.
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Semantic mismatch:</strong> Statement/Question đôi khi cần reasoning/chunk đúng → embedding không bắt đủ.
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Translation issue:</strong> Cross-language thường giảm match nếu embedding không đủ cross-lingual.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}