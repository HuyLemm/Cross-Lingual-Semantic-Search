"use client";

import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Separator } from "../../ui/separator";
import { Textarea } from "../../ui/textarea";

import { Play, RotateCcw } from "lucide-react";

import type {
  LanguageCode,
  EmbedModel,
  VectorIndex,
  RetrievalEngine,
  RerankerMethod,
  RankingMethod,
} from "./types";

type Props = {
  // values
  query: string;
  chunkEmbeddingModel: EmbedModel;
  queryEmbeddingModel: EmbedModel;
  vectorIndex: VectorIndex;
  retrievalEngine: RetrievalEngine;
  reranker: RerankerMethod;
  rankingMethod: RankingMethod;
  topK: number[];

  masterOption: "opt1" | "opt2";

  // setters
  setQuery: (v: string) => void;
  setChunkEmbeddingModel: (v: EmbedModel) => void;
  setQueryEmbeddingModel: (v: EmbedModel) => void;
  setVectorIndex: (v: VectorIndex) => void;
  setRetrievalEngine: (v: RetrievalEngine) => void;
  setReranker: (v: RerankerMethod) => void;
  setRankingMethod: (v: RankingMethod) => void;

  setTopK: (v: number[]) => void;

  // ✅ NEW: apply option -> sync all 6 selects
  onSelectMasterOption: (v: "opt1" | "opt2") => void;

  // actions
  running: boolean;
  error: string | null;
  onRun: () => void;
  onReset: () => void;
};

export default function LeftPanel(props: Props) {
  const {
    query,
    setQuery,
    chunkEmbeddingModel,
    setChunkEmbeddingModel,
    queryEmbeddingModel,
    setQueryEmbeddingModel,
    vectorIndex,
    setVectorIndex,
    retrievalEngine,
    setRetrievalEngine,
    reranker,
    setReranker,
    rankingMethod,
    setRankingMethod,

    topK,
    setTopK,

    masterOption,
    onSelectMasterOption,

    running,
    error,
    onRun,
    onReset,
  } = props;

  const configLocked = true;

  return (
    <div className="w-full border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-y-auto">
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Experiment Configuration
        </h2>

        {/* QUERY */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
            Query
          </Label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a query to test semantic search…"
            className="text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 min-h-[80px] resize-y leading-relaxed"
          />
        </div>

        <Separator className="dark:bg-slate-700" />

        <div className="space-y-4">
          {/* ✅ Master Option (sync 6 configs below) */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Config Option
            </Label>

            <Select
              value={masterOption}
              onValueChange={(v) => onSelectMasterOption(v as "opt1" | "opt2")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opt1">MiniLM Semantic Search</SelectItem>
                <SelectItem value="opt2">BGE Semantic Search</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
              Option 1/2 will auto-set the 6 configs below.
            </p>
          </div>

          {/* Chunk Embedding */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Chunk Embedding Model
            </Label>
            <Select
              value={chunkEmbeddingModel}
              onValueChange={(v) => setChunkEmbeddingModel(v as EmbedModel)}
              disabled={configLocked}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minilm">
                  MiniLM (paraphrase-multilingual-MiniLM-L12-v2)
                </SelectItem>
                <SelectItem value="bge-m3">BGE-M3 (BAAI/bge-m3)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Query Embedding */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Query Embedding Model
            </Label>
            <Select
              value={queryEmbeddingModel}
              onValueChange={(v) => setQueryEmbeddingModel(v as EmbedModel)}
              disabled={configLocked}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minilm">
                  MiniLM (paraphrase-multilingual-MiniLM-L12-v2)
                </SelectItem>
                <SelectItem value="bge-m3">BGE-M3 (BAAI/bge-m3)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vector Index */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Vector Index
            </Label>
            <Select
              value={vectorIndex}
              onValueChange={(v) => setVectorIndex(v as VectorIndex)}
              disabled={configLocked}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flatip_cpu">
                  FAISS IndexFlatIP (CPU)
                </SelectItem>
                <SelectItem value="flatip_cpu_72t">
                  FAISS IndexFlatIP (72 threads)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Retrieval */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Stage-1 Retrieval
            </Label>
            <Select
              value={retrievalEngine}
              onValueChange={(v) => setRetrievalEngine(v as RetrievalEngine)}
              disabled={configLocked}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faiss_cpu">FAISS CPU</SelectItem>
                <SelectItem value="faiss_cpu_72t">
                  FAISS CPU (72 threads)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reranker */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Stage-2 Reranker
            </Label>
            <Select
              value={reranker}
              onValueChange={(v) => setReranker(v as RerankerMethod)}
              disabled={configLocked}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">
                  Hybrid Scoring (cosine + keyword + fact)
                </SelectItem>
                <SelectItem value="bge-reranker-v2-m3">
                  BAAI/bge-reranker-v2-m3
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ranking */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Ranking Method
            </Label>
            <Select
              value={rankingMethod}
              onValueChange={(v) => setRankingMethod(v as RankingMethod)}
              disabled={true /* lock always */}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heuristic">Heuristic Score</SelectItem>
                <SelectItem value="cross_encoder">
                  Cross-Encoder Score
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="dark:bg-slate-700" />

        {/* TOP K */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Top-K Results
            </Label>
            <span className="text-sm font-mono">{topK[0]}</span>
          </div>
          <Slider
            value={topK}
            onValueChange={setTopK}
            min={1}
            max={50}
            step={1}
          />
        </div>

        {/* BUTTONS */}
        <div className="space-y-2 pt-4">
          <Button
            onClick={onRun}
            disabled={running}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white"
          >
            {running ? (
              <>Running...</>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Experiment
              </>
            )}
          </Button>

          <Button variant="outline" onClick={onReset} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
