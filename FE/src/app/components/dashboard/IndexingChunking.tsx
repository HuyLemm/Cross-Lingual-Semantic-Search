import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import IndexingChunkingHeader from "./indexing-chunking/IndexingChunkingHeader";
import IndexingStrategyTable, {
  IndexingStrategy,
} from "./indexing-chunking/IndexingStrategyTable";
import ChunkingStrategyTable from "./indexing-chunking/ChunkingStrategyTable";
import IndexingCharts from "./indexing-chunking/IndexingCharts";
import ChunkingCharts from "./indexing-chunking/ChunkingCharts";
import StrategyRecommendations from "./indexing-chunking/StrategyRecommendations";

type ChunkingStrategy = {
  name: string;
  avgChunks: number;
  recall: number | null;
  overlap: number;
  coherence: number | null;
  notes?: string;
};

type BundleModel = {
  indexingStrategies: IndexingStrategy[];
  chunkingStrategies: ChunkingStrategy[];
  buildTimeComparisonData: Array<{ strategy: string; time: number }>;
  queryLatencyComparisonData: Array<{ strategy: string; latency: number }>;
};

type ApiResponse = {
  ok: boolean;
  models?: {
    LLM: BundleModel;
    BGE: BundleModel;
  };
  error?: string;
};

export default function IndexingChunking() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modelKey, setModelKey] = useState<"LLM" | "BGE">("LLM");
  const [models, setModels] = useState<ApiResponse["models"] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("http://localhost:4000/add/indexing-chunking");
        const json = (await res.json()) as ApiResponse;

        if (!json.ok || !json.models)
          throw new Error(json.error || "Failed to load evaluation data");

        if (!cancelled) setModels(json.models);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeModel = models ? models[modelKey] : null;

  // ⚠️ backend chưa trả chunkSizeAccuracyData => để rỗng
  const chunkSizeAccuracyData: any[] = [];

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900">
      <div className="mx-auto w-full max-w-[1700px] px-8 py-6 space-y-6">
        <IndexingChunkingHeader
          modelKey={modelKey}
          onModelChange={setModelKey}
        />

        {loading ? (  
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Loader2 className="h-10 w-10 animate-spin" />
              <span className="text-sm font-medium">
                Loading indexing and chunking data...
              </span>
            </div>
          </div>
        ) : err ? (
          <div className="text-sm text-red-600 dark:text-red-400">{err}</div>
        ) : !activeModel ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No data.
          </div>
        ) : (
          <>
            <IndexingStrategyTable
              strategies={activeModel.indexingStrategies || []}
            />

            <ChunkingStrategyTable
              strategies={activeModel.chunkingStrategies || []}
            />

            <IndexingCharts
              buildTimeData={activeModel.buildTimeComparisonData || []}
              queryLatencyData={activeModel.queryLatencyComparisonData || []}
            />

            <ChunkingCharts
              modelKey={modelKey}
              chunkSizeData={chunkSizeAccuracyData as any}
              indexingStrategies={activeModel.indexingStrategies || []}
              models={models} // ✅ truyền cả 2 model để làm bảng Delta bên trái
            />

            <StrategyRecommendations
              modelKey={modelKey}
              indexingStrategies={activeModel.indexingStrategies || []}
              chunkingStrategies={activeModel.chunkingStrategies || []}
            />
          </>
        )}
      </div>
    </div>
  );
}
