"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Search, BarChart3, Timer, Layers, Loader2 } from "lucide-react";

import type {
  LanguageCode,
  EmbedModel,
  VectorIndex,
  RetrievalEngine,
  RerankerMethod,
  RankingMethod,
} from "./types";

import {
  labelLanguage,
  labelEmbedModel,
  labelVectorIndex,
  labelRetrieval,
  labelReranker,
  labelRanking,
} from "./helpers";

export type RunSnapshot = {
  chunkEmbeddingModel: EmbedModel;
  queryEmbeddingModel: EmbedModel;
  vectorIndex: VectorIndex;
  retrievalEngine: RetrievalEngine;
  reranker: RerankerMethod;
  rankingMethod: RankingMethod;
  topK: number[];
};

export default function RightPanel(props: {
  snapshot: RunSnapshot | null; 
  returned: number; 
  latencyMs: number | null; 
  running: boolean;  
}) {
  const { snapshot, returned, latencyMs, running } = props;

  const latencyText =
    typeof latencyMs === "number" && Number.isFinite(latencyMs)
      ? `${latencyMs.toFixed(0)} ms`
      : "-";

  const canShowMetrics = !!snapshot && !running;

  return (
    <div
      className={[
        "h-full w-[320px] shrink-0",
        "border-l border-gray-200 dark:border-slate-700",
        "bg-gradient-to-b from-gray-50 to-white dark:from-slate-850 dark:to-slate-900",
        "overflow-y-auto",
      ].join(" ")}
    >
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wide">
            Run Metrics
          </h3>

          <Badge
            variant="outline"
            className="text-[11px] border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/30"
            title="Updates after you click Run"
          >
            Snapshot
          </Badge>
        </div>

        {/* LOADING (during run) */}
        {running && (
          <Card className="border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-700 dark:text-slate-200" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    Running...
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    Waiting for response
                  </p>
                </div>
              </div>

              {/* Skeleton tiles */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 px-3 py-2">
                  <div className="h-3 w-16 rounded bg-gray-200/80 dark:bg-slate-700/60 animate-pulse" />
                  <div className="mt-2 h-4 w-20 rounded bg-gray-200/80 dark:bg-slate-700/60 animate-pulse" />
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 px-3 py-2">
                  <div className="h-3 w-16 rounded bg-gray-200/80 dark:bg-slate-700/60 animate-pulse" />
                  <div className="mt-2 h-4 w-24 rounded bg-gray-200/80 dark:bg-slate-700/60 animate-pulse" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100/70 dark:bg-slate-900/30 animate-pulse" />
                <div className="h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100/70 dark:bg-slate-900/30 animate-pulse" />
                <div className="h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100/70 dark:bg-slate-900/30 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* BEFORE RUN (snapshot=null and not running) */}
        {!snapshot && !running && (
          <Card className="border-dashed border-gray-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm">
                  <Search className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  Waiting for Run
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-slate-400 max-w-xs">
                  Right panel will update only after you click{" "}
                  <span className="font-semibold">Run Experiment</span>.
                </p>

                <div className="mt-4 flex gap-2 flex-wrap justify-center">
                  <Badge variant="outline" className="text-xs">
                    Returned
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Latency
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AFTER RUN (only show when not running to avoid stale values) */}
        {canShowMetrics && (
          <>
            {/* SUMMARY STRIP */}
            <div className="grid grid-cols-2 gap-3">
              <SummaryTile
                icon={<Layers className="h-4 w-4" />}
                label="Returned"
                value={String(returned)}
              />
              <SummaryTile
                icon={<Timer className="h-4 w-4" />}
                label="Latency"
                value={latencyText}
              />
            </div>

            {/* CONFIG SNAPSHOT */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                  Configuration Snapshot
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-xs">
                <Row k="Chunk Embed" v={labelEmbedModel(snapshot!.chunkEmbeddingModel)} />
                <Row k="Query Embed" v={labelEmbedModel(snapshot!.queryEmbeddingModel)} />
                <Row k="Vector Index" v={labelVectorIndex(snapshot!.vectorIndex)} />
                <Row k="Retrieval" v={labelRetrieval(snapshot!.retrievalEngine)} />
                <Row k="Reranker" v={labelReranker(snapshot!.reranker)} />
                <Row k="Ranking" v={labelRanking(snapshot!.rankingMethod)} />
                <Row k="Top-K" v={String(snapshot!.topK[0])} />
              </CardContent>
            </Card>

            {/* RUN RESULTS */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Run Results
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <Metric
                  label="Search Latency"
                  value={latencyText}
                  hint="Backend: search_latency_ms"
                />
                <Metric label="Returned" value={String(returned)} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryTile(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { icon, label, value } = props;
  return (
    <div
      className={[
        "rounded-xl border border-gray-200 dark:border-slate-700",
        "bg-white/70 dark:bg-slate-900/40",
        "px-3 py-2 shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
        <span className="text-gray-700 dark:text-slate-300">{icon}</span>
        <span className="uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="mt-1 font-mono text-sm text-gray-900 dark:text-slate-100 break-words">
        {value}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-600 dark:text-slate-400 shrink-0">{k}</span>
      <span className="ml-auto text-right font-mono text-gray-900 dark:text-slate-100 min-w-0 max-w-[200px] whitespace-normal break-words">
        {v}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-lg px-3 py-2",
        "border border-gray-200 dark:border-slate-700",
        "bg-white/60 dark:bg-slate-900/30",
      ].join(" ")}
      title={hint}
    >
      <span className="text-gray-600 dark:text-slate-400 shrink-0">{label}</span>
      <span className="ml-auto text-right font-mono text-gray-900 dark:text-slate-100 min-w-0 max-w-[200px] whitespace-normal break-words">
        {value}
      </span>
    </div>
  );
}