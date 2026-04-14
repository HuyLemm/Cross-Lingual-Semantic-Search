import { useMemo, useState } from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { QueryRow, QueryStatus } from "./QueryTest.constants";
import { QueryTestFilters } from "./QueryTestFilters";
import { ChevronDown, ChevronRight } from "lucide-react";

function StatusBadge({ status }: { status: QueryStatus }) {
  if (status === "success")
    return <Badge className="bg-green-600 text-white text-xs">Success</Badge>;
  if (status === "partial")
    return <Badge className="bg-yellow-600 text-white text-xs">Partial</Badge>;
  return <Badge className="bg-red-600 text-white text-xs">Failed</Badge>;
}

function EngineBadge({ engine }: { engine?: string }) {
  const e = (engine || "UNKNOWN").toUpperCase();
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

function SafeNum({ v, digits = 2 }: { v: any; digits?: number }) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return <span className="text-gray-400">—</span>;
  return <>{n.toFixed(digits)}</>;
}

export function QueryTestAllQueries(props: {
  rows: QueryRow[];

  queryTypeFilter: string;
  setQueryTypeFilter: (v: string) => void;
  languageFilter: string;
  setLanguageFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;

  availableTypes: string[];
}) {
  const {
    rows,
    queryTypeFilter,
    setQueryTypeFilter,
    languageFilter,
    setLanguageFilter,
    statusFilter,
    setStatusFilter,
    availableTypes,
  } = props;

  // Expand state: key = `${id}-${engine}` để tránh trùng id giữa LLM/BGE
  const [openKey, setOpenKey] = useState<string | null>(null);

  const keyedRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      _key: `${String((r as any).id)}-${String((r as any).engine || "UNKNOWN")}`,
    }));
  }, [rows]);

  const toggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6">
      <QueryTestFilters
        queryTypeFilter={queryTypeFilter}
        setQueryTypeFilter={setQueryTypeFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        availableTypes={availableTypes}
      />

      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            All Tested Queries ({rows.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto max-h-[650px]">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  {/* Expand */}
                  <th className="w-[36px] py-3 px-2" />

                  {/* NEW: Engine first */}
                  <th className="text-left py-3 px-3 font-semibold">Engine</th>

                  <th className="text-left py-3 px-3 font-semibold">
                    Query Input
                  </th>
                  <th className="text-left py-3 px-3 font-semibold">
                    Query Type
                  </th>
                  <th className="text-center py-3 px-3 font-semibold">
                    Language
                  </th>
                  <th className="text-left py-3 px-3 font-semibold">
                    Top Retrieved Document
                  </th>
                  <th className="text-center py-3 px-3 font-semibold">
                    Similarity
                  </th>
                  <th className="text-center py-3 px-3 font-semibold">Rank</th>
                  <th className="text-center py-3 px-3 font-semibold">
                    Recall@10
                  </th>
                  <th className="text-center py-3 px-3 font-semibold">MRR</th>
                  <th className="text-center py-3 px-3 font-semibold">
                    Latency (ms)
                  </th>

                  <th className="text-center py-3 px-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-850">
                {keyedRows.map((q) => {
                  const isOpen = openKey === (q as any)._key;

                  const candidates: any[] = Array.isArray(
                    (q as any).top_candidates,
                  )
                    ? (q as any).top_candidates
                    : [];

                  return (
                    <>
                      <tr
                        key={(q as any)._key}
                        className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        {/* Expand toggle */}
                        <td className="py-2 px-2">
                          <button
                            type="button"
                            onClick={() => toggle((q as any)._key)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
                            title={isOpen ? "Collapse" : "Expand"}
                          >
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                            )}
                          </button>
                        </td>

                        {/* Engine */}
                        <td className="py-3 px-3">
                          <EngineBadge engine={(q as any).engine} />
                        </td>

                        <td className="py-3 px-3 text-gray-900 dark:text-slate-100 max-w-xs">
                          {(q as any).query}
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 dark:border-slate-600"
                          >
                            {(q as any).type}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant="outline"
                            className="text-xs border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400"
                          >
                            {(q as any).language}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-gray-700 dark:text-slate-300 max-w-xs truncate">
                          {(q as any).topDoc}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">
                          <SafeNum v={(q as any).similarity} digits={2} />
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          {(q as any).rank}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <SafeNum v={(q as any).recall10} digits={1} />
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <SafeNum v={(q as any).mrr} digits={2} />
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          <SafeNum v={(q as any).latency_ms} digits={0} />
                        </td>

                        <td className="py-3 px-3 text-center">
                          <StatusBadge status={(q as any).status} />
                        </td>

                        {/* Latency */}
                        
                      </tr>

                      {/* Expanded details row */}
                      {isOpen && (
                        <tr className="border-t border-gray-100 dark:border-slate-800">
                          <td
                            colSpan={12}
                            className="py-4 px-4 bg-gray-50/60 dark:bg-slate-900/40"
                          >
                            <div className="space-y-4">
                              {/* Summary line */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  ID: {String((q as any).id)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Usecase:{" "}
                                  {String(
                                    (q as any).usecase || (q as any).type,
                                  )}
                                </Badge>
                              </div>

                              {/* Metrics detail */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-3">
                                  <p className="text-[11px] text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                                    Hit@K
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                                    <span>
                                      hit@1: {(q as any)["hit@1"] ?? "—"}
                                    </span>
                                    <span>
                                      hit@3: {(q as any)["hit@3"] ?? "—"}
                                    </span>
                                    <span>
                                      hit@5: {(q as any)["hit@5"] ?? "—"}
                                    </span>
                                    <span>
                                      hit@10: {(q as any)["hit@10"] ?? "—"}
                                    </span>
                                  </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-3">
                                  <p className="text-[11px] text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                                    Best Score@K
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                                    <span>
                                      bs@1: {(q as any)["best_score@1"] ?? "—"}
                                    </span>
                                    <span>
                                      bs@3: {(q as any)["best_score@3"] ?? "—"}
                                    </span>
                                    <span>
                                      bs@5: {(q as any)["best_score@5"] ?? "—"}
                                    </span>
                                    <span>
                                      bs@10:{" "}
                                      {(q as any)["best_score@10"] ?? "—"}
                                    </span>
                                  </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-3">
                                  <p className="text-[11px] text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                                    Top1
                                  </p>
                                  <div className="text-xs space-y-1">
                                    <div className="font-mono">
                                      top1_score:{" "}
                                      <SafeNum
                                        v={(q as any).top1_score}
                                        digits={3}
                                      />
                                    </div>
                                    <div className="truncate">
                                      <span className="text-gray-600 dark:text-slate-400">
                                        title:
                                      </span>{" "}
                                      {String(
                                        (q as any).top1_title ||
                                          (q as any).topDoc ||
                                          "—",
                                      )}
                                    </div>
                                    <div className="truncate">
                                      <span className="text-gray-600 dark:text-slate-400">
                                        file:
                                      </span>{" "}
                                      {String(
                                        (q as any).top1_source_file || "—",
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Candidates table */}
                              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850">
                                <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                                    Top Candidates ({candidates.length})
                                  </p>
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                    rank / score / faiss_score / source_file /
                                    title / snippet
                                  </p>
                                </div>

                                <div className="overflow-auto max-h-[320px]">
                                  <table className="w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                                      <tr>
                                        <th className="text-center py-2 px-2 font-semibold">
                                          Rank
                                        </th>
                                        <th className="text-center py-2 px-2 font-semibold">
                                          Score
                                        </th>
                                        <th className="text-center py-2 px-2 font-semibold">
                                          FAISS
                                        </th>
                                        <th className="text-left py-2 px-2 font-semibold">
                                          Source File
                                        </th>
                                        <th className="text-left py-2 px-2 font-semibold">
                                          Title
                                        </th>
                                        <th className="text-left py-2 px-2 font-semibold">
                                          Snippet
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody className="bg-white dark:bg-slate-850">
                                      {candidates.map((c, i) => (
                                        <tr
                                          key={`${(q as any)._key}-cand-${i}`}
                                          className="border-t border-gray-100 dark:border-slate-800"
                                        >
                                          <td className="py-2 px-2 text-center font-mono">
                                            {c?.rank ?? "—"}
                                          </td>
                                          <td className="py-2 px-2 text-center font-mono">
                                            <SafeNum v={c?.score} digits={3} />
                                          </td>
                                          <td className="py-2 px-2 text-center font-mono">
                                            <SafeNum
                                              v={c?.faiss_score}
                                              digits={3}
                                            />
                                          </td>
                                          <td className="py-2 px-2 max-w-[260px] truncate">
                                            {String(c?.source_file || "—")}
                                          </td>
                                          <td className="py-2 px-2 max-w-[340px] truncate">
                                            {String(c?.title || "—")}
                                          </td>
                                          <td className="py-2 px-2 max-w-[520px]">
                                            <p className="line-clamp-2 text-gray-700 dark:text-slate-300">
                                              {String(c?.snippet || "—")}
                                            </p>
                                          </td>
                                        </tr>
                                      ))}

                                      {!candidates.length && (
                                        <tr className="border-t border-gray-100 dark:border-slate-800">
                                          <td
                                            colSpan={6}
                                            className="py-4 px-3 text-center text-gray-500"
                                          >
                                            No candidates found.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
