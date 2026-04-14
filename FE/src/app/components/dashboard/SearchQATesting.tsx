// SearchQATesting.tsx
"use client";

import { useEffect, useState } from "react";

import LeftPanel from "./search-qa-testing/LeftPanel";
import MiddleTop from "./search-qa-testing/MiddleTop";
import MiddleBottom from "./search-qa-testing/MiddleBottom";
import RightPanel from "./search-qa-testing/RightPanel";
import SearchVisualization from "./search-qa-testing/SearchVisualization";
import QAPairPDFViewerModal from "./qa-validation/QAPairPDFViewerModal";

import type {
  EmbedModel,
  VectorIndex,
  RetrievalEngine,
  RerankerMethod,
  RankingMethod,
  BackendResult,
} from "./search-qa-testing/types";

type RunSnapshot = {
  chunkEmbeddingModel: EmbedModel;
  queryEmbeddingModel: EmbedModel;
  vectorIndex: VectorIndex;
  retrievalEngine: RetrievalEngine;
  reranker: RerankerMethod;
  rankingMethod: RankingMethod;
  topK: number[];
};

type PdfMeta = {
  dataset: string;
  pdfName: string;
  sizeBytes: number;
  pages: number | null;
  pageNumber: number | null;
  chunk_id: string | null;
  pdfUrl: string;
  downloadUrl: string;
};

const API_BASE = "http://localhost:4000";

export default function SearchQATesting() {
  const [running, setRunning] = useState(false);
  const [topK, setTopK] = useState([10]);
  const [query, setQuery] = useState("");

  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfMeta, setPdfMeta] = useState<PdfMeta | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<BackendResult | null>(
    null,
  );

  const [hasSearched, setHasSearched] = useState(false);
  const [snapshot, setSnapshot] = useState<RunSnapshot | null>(null);

  const [keywords, setKeywords] = useState<string[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const [masterOption, setMasterOption] = useState<"opt1" | "opt2">("opt1");

  const [chunkEmbeddingModel, setChunkEmbeddingModel] =
    useState<EmbedModel>("minilm");
  const [queryEmbeddingModel, setQueryEmbeddingModel] =
    useState<EmbedModel>("minilm");

  const [vectorIndex, setVectorIndex] = useState<VectorIndex>("flatip_cpu");
  const [retrievalEngine, setRetrievalEngine] =
    useState<RetrievalEngine>("faiss_cpu");

  const [reranker, setReranker] = useState<RerankerMethod>("hybrid");
  const [rankingMethod, setRankingMethod] =
    useState<RankingMethod>("heuristic");

  const [queryUsed, setQueryUsed] = useState<string>("");
  const [results, setResults] = useState<BackendResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // APPLY MASTER OPTION
  // =========================
  const applyMasterOption = (opt: "opt1" | "opt2") => {
    setMasterOption(opt);

    if (opt === "opt1") {
      setChunkEmbeddingModel("minilm");
      setQueryEmbeddingModel("minilm");
      setVectorIndex("flatip_cpu");
      setRetrievalEngine("faiss_cpu");
      setReranker("hybrid");
      setRankingMethod("heuristic");
    } else {
      setChunkEmbeddingModel("bge-m3");
      setQueryEmbeddingModel("bge-m3");
      setVectorIndex("flatip_cpu_72t");
      setRetrievalEngine("faiss_cpu_72t");
      setReranker("bge-reranker-v2-m3");
      setRankingMethod("cross_encoder");
    }
  };

  const resolveDatasetFolders = () => {
  return ["articles_en", "articles_vi"];
};

  const handleOpenPdfFromResult = async (r: BackendResult) => {
    setSelectedResult(r);
    setIsPdfOpen(true);
    setPdfLoading(true);
    setPdfError(null);
    setPdfMeta(null);

    try {
      const folders = resolveDatasetFolders();

      let lastErr: any = null;

      for (const datasetFolder of folders) {
        try {
          const params = new URLSearchParams();
          params.set("dataset", datasetFolder);
          params.set("pdf", r.file ?? "");
          // nếu backend có chunk_id thì gắn vào (optional)
          // @ts-ignore
          if ((r as any).chunk_id)
            params.set("chunk_id", String((r as any).chunk_id));

          const res = await fetch(`${API_BASE}/qa/doc-meta?${params.toString()}`);
          const data = await res.json();

          if (!res.ok) throw new Error(data?.error || "Failed to load PDF meta");
          setPdfMeta(data);
          lastErr = null;
          break; // ✅ found
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (lastErr) throw lastErr;
    } catch (e: any) {
      setPdfError(e?.message || "Failed to load PDF meta");
    } finally {
      setPdfLoading(false);
    }
  };

  // =========================
  // API
  // =========================
  const API_URL = "http://localhost:5000/search";

  const handleRun = async () => {
    setHasSearched(true);

    setLatencyMs(null);
    setResults([]);
    setQueryUsed("");
    setKeywords([]);

    // Snapshot config at run time
    setSnapshot({
      chunkEmbeddingModel,
      queryEmbeddingModel,
      vectorIndex,
      retrievalEngine,
      reranker,
      rankingMethod,
      topK,
    });

    setRunning(true);
    setError(null);

    try {
      const payload = {
        text: query,
        chunk_embedding_model: chunkEmbeddingModel,
        query_embedding_model: queryEmbeddingModel,
        vector_index: vectorIndex,
        retrieval_engine: retrievalEngine,
        reranker: reranker,
        ranking_method: rankingMethod,
        top_k: topK[0],
      };

      console.log(payload);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }

      const data = await res.json();
      console.log(data);

      setQueryUsed(data.query_used || "");
      setResults(Array.isArray(data.results) ? data.results : []);
      setKeywords(Array.isArray(data.keywords) ? data.keywords : []);
      setLatencyMs(
        typeof data.search_latency_ms === "number" ? data.search_latency_ms : null,
      );
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setQueryUsed("");
      setResults([]);
      setKeywords([]);
      setLatencyMs(null);
    } finally {
      setRunning(false);
    }
  };

  // =========================
  // RESET
  // =========================
  const handleReset = () => {
    setHasSearched(false);
    setSnapshot(null);

    setTopK([10]);
    setQuery("");

    applyMasterOption("opt1");

    setQueryUsed("");
    setResults([]);
    setError(null);
    setKeywords([]);
    setLatencyMs(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen ">
      <div className="grid h-full min-h-0 grid-cols-[290px_1fr_auto] grid-rows-[1fr_auto]">
        <div className="row-span-2 col-start-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <LeftPanel
            query={query}
            setQuery={setQuery}
            chunkEmbeddingModel={chunkEmbeddingModel}
            setChunkEmbeddingModel={setChunkEmbeddingModel}
            queryEmbeddingModel={queryEmbeddingModel}
            setQueryEmbeddingModel={setQueryEmbeddingModel}
            vectorIndex={vectorIndex}
            setVectorIndex={setVectorIndex}
            retrievalEngine={retrievalEngine}
            setRetrievalEngine={setRetrievalEngine}
            reranker={reranker}
            setReranker={setReranker}
            rankingMethod={rankingMethod}
            setRankingMethod={setRankingMethod}
            topK={topK}
            setTopK={setTopK}
            running={running}
            error={error}
            onRun={handleRun}
            onReset={handleReset}
            masterOption={masterOption}
            onSelectMasterOption={applyMasterOption}
          />
        </div>

        <div
          className={[
            "row-start-1 col-start-2 min-h-0 grid overflow-hidden",
            "grid-rows-[auto_800px]",
          ].join(" ")}
        >
          {/* Row 1 */}
          <div className="min-h-0 overflow-hidden">
            <MiddleTop/>
          </div>

          {/* Row 2 */}
          <div className="min-h-0 overflow-y-auto overflow-x-hidden">
            <MiddleBottom
              results={results}
              queryUsed={queryUsed}
              query={query}
              keywords={keywords}
              running={running}
              hasSearched={hasSearched}
              onOpenPdf={handleOpenPdfFromResult}
            />
          </div>
        </div>

        <div className="row-start-1 col-start-3 min-h-0 overflow-hidden">
          <RightPanel
            snapshot={snapshot}
            returned={results.length}
            latencyMs={latencyMs}
            running={running}
          />
        </div>

        <div className="row-start-2 col-start-2 col-span-2 border-t border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <SearchVisualization />
          </div>
        </div>

        {isPdfOpen && selectedResult && (
          <QAPairPDFViewerModal
            // @ts-ignore - adapter nhanh, hoặc bạn sửa modal cho accept result
            qa={{
              id: "search-result",
              sourceDocument: selectedResult.file ?? "",
              // @ts-ignore
              chunk_id: (selectedResult as any).chunk_id ?? null,
              question: queryUsed || query,
              answer: "",
            }}
            meta={pdfMeta}
            loading={pdfLoading}
            error={pdfError}
            onClose={() => {
              setIsPdfOpen(false);
              setPdfMeta(null);
              setPdfError(null);
              setSelectedResult(null);
            }}
          />
        )}
      </div>
    </div>
  );
}