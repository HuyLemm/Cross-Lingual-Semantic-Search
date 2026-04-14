import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { QueryTestAllQueries } from "./query-test/QueryTestAllQueries";
import { QueryTestQueryTypes } from "./query-test/QueryTestQueryTypes";
import { QueryTestLanguageAnalysis } from "./query-test/QueryTestLanguageAnalysis";
import { QueryTestDiagnostics } from "./query-test/QueryTestDiagnostics";
import LoadingSpinner from "../ui/loading-spinner";

import type { QueryRow } from "./query-test/QueryTest.constants";

type ApiResponse = {
  ok: boolean;
  rows: QueryRow[];

  // (optional) backend may still return these; we can use them where appropriate
  languageData?: any[];
  heatmapData?: any[];
  recallAtK?: any[];
  mrrDistribution?: any[];
  similarityDistribution?: any[];
  failedQueries?: any[];

  meta?: {
    threshold?: number;
    total?: number;
  };

  error?: string;
};

export default function QueryTestResults() {
  const [activeSection, setActiveSection] = useState("all");
  const [queryTypeFilter, setQueryTypeFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<ApiResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);

        // ✅ keep your current endpoint
        const res = await fetch("http://localhost:4000/query-test/query");
        const data = (await res.json()) as ApiResponse;
        console.log(data);

        if (!mounted) return;
        setApi(data);
      } catch (e: any) {
        if (!mounted) return;
        setApi({ ok: false, rows: [], error: String(e?.message || e) });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const allRows = api?.rows || [];

  const availableTypes = useMemo(() => {
    const s = new Set(allRows.map((r) => r.type).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allRows]);

  const filteredQueries = useMemo(() => {
    return allRows.filter((q) => {
      if (queryTypeFilter !== "all" && q.type !== queryTypeFilter) return false;
      if (languageFilter !== "all" && q.language !== languageFilter)
        return false;
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      return true;
    });
  }, [allRows, queryTypeFilter, languageFilter, statusFilter]);

  const avgRecall10 = useMemo(() => {
    if (!allRows.length) return "0.000";
    return (
      allRows.reduce((sum, q) => sum + q.recall10, 0) / allRows.length
    ).toFixed(3);
  }, [allRows]);

  const avgMRR = useMemo(() => {
    if (!allRows.length) return "0.000";
    return (
      allRows.reduce((sum, q) => sum + q.mrr, 0) / allRows.length
    ).toFixed(3);
  }, [allRows]);

  const avgSimilarity = useMemo(() => {
    if (!allRows.length) return "0.000";
    return (
      allRows.reduce((sum, q) => sum + q.similarity, 0) / allRows.length
    ).toFixed(3);
  }, [allRows]);

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Query Test Results
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Evaluate semantic search query performance across different types,
            languages, and retrieval metrics
          </p>

          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner />
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Loading query results...
                </p>
              </div>
            </div>
          )}
          {!loading && api && !api.ok && (
            <p className="text-xs mt-2 text-red-600">
              Failed to load: {api.error || "unknown error"}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-5 w-full bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger value="all">All Queries</TabsTrigger>
            <TabsTrigger value="types">Query Types</TabsTrigger>
            <TabsTrigger value="language">Language Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="failures">Failure Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <QueryTestAllQueries
              rows={filteredQueries}
              queryTypeFilter={queryTypeFilter}
              setQueryTypeFilter={setQueryTypeFilter}
              languageFilter={languageFilter}
              setLanguageFilter={setLanguageFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              availableTypes={availableTypes}
            />
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            {/* ✅ compare engines on FE by using rows */}
            <QueryTestQueryTypes rows={allRows} />
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <QueryTestLanguageAnalysis
              languageData={api?.languageData || []}
              mrrDistribution={api?.mrrDistribution || []}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <QueryTestDiagnostics mode="performance" rows={allRows} />
          </TabsContent>

          <TabsContent value="failures" className="space-y-6">
            <QueryTestDiagnostics mode="failures" rows={allRows} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
