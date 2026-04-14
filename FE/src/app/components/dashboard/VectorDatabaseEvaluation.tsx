import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import VectorDatabaseHeader from "./vector-database/VectorDatabaseHeader";
import DatabaseSummaryCards from "./vector-database/DatabaseSummaryCards";
import DatabaseComparisonTable from "./vector-database/DatabaseComparisonTable";
import SearchLatencyChart from "./vector-database/SearchLatencyChart";
import RecallComparisonChart from "./vector-database/RecallComparisonChart";
import StorageCostChart from "./vector-database/StorageCostChart";
import InsertSpeedChart from "./vector-database/InsertSpeedChart";

type IndexingStrategy = {
  name: string;
  buildTime: number;
  queryLatency: number;
  recall: number | null;
  memory: number | null;
  bestFor?: string;
};

type VectorDbCards = {
  best_recall: number; // 0..1
  fastest_insert_vecs_per_s: number;
  lowest_latency_ms: number;
  lowest_storage_gb: number;
};

type VectorDbRow = {
  strategy: string;
  insert_speed_vecs_per_s: number;
  search_latency_ms: number;
  recall_at_10: number; // 0..1
  storage_gb: number;
  features?: string[];
};

type VectorDatabasePayload = {
  cards: VectorDbCards;
  faiss_rows: VectorDbRow[];
  selected?: string; // "FAISS"
};

type BundleModel = {
  indexingStrategies: IndexingStrategy[];
  chunkingStrategies?: any[];
  buildTimeComparisonData?: any[];
  queryLatencyComparisonData?: any[];
  meta?: any;
  raw?: any;

  // ✅ theo console của bạn
  vector_database?: VectorDatabasePayload;

  selectedChunking?: string;
  selectedIndexing?: string;
};

type ApiResponse = {
  ok: boolean;
  files?: any;
  models?: {
    LLM: BundleModel;
    BGE: BundleModel;
  };
  resolvedBaseDir?: string;
  error?: string;
};

function gbToMb(gb: number) {
  return gb * 1024;
}

export default function VectorDatabaseEvaluation() {
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
        console.log(json);

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

  // ✅ đổi model -> đổi vector_database tương ứng
  const activeModel = models ? models[modelKey] : null;
  const vectorDb = activeModel?.vector_database || null;

  const cards = vectorDb?.cards || null;
  const rows = vectorDb?.faiss_rows || [];

  // ===== derive datasets for existing charts/tables =====
  // ✅ Table của bạn (DatabaseComparisonTable) đã sửa để nhận faiss_rows raw (strategy/insert_speed/.../storage_gb)
  const databases = useMemo(
    () =>
      rows.map((r) => ({
        strategy: r.strategy,
        insert_speed_vecs_per_s: r.insert_speed_vecs_per_s,
        search_latency_ms: r.search_latency_ms,
        recall_at_10: r.recall_at_10,
        storage_gb: r.storage_gb,
        features: r.features,
      })),
    [rows],
  );

  // ✅ Charts: map từ faiss_rows
  const searchLatencyData = useMemo(
    () =>
      rows.map((r) => ({
        database: r.strategy,
        latency: r.search_latency_ms,
      })),
    [rows],
  );

  const recallComparisonData = useMemo(
    () =>
      rows.map((r) => ({
        database: r.strategy,
        recall: r.recall_at_10,
      })),
    [rows],
  );

  // ✅ Storage: GB -> MB (đúng yêu cầu)
  const storageCostData = useMemo(
    () =>
      rows
        .map((r) => {
          const gb = r?.storage_gb == null ? NaN : Number(r.storage_gb);
          const mb = Number.isFinite(gb) ? gbToMb(gb) : NaN;

          return {
            database: String(r?.strategy ?? ""),
            storage: Number.isFinite(mb) ? mb : null,
          };
        })
        .filter((d) => d.database),
    [rows],
  );

  // ✅ Insert Speed data
  // InsertSpeedChart (bản mình sửa) nhận: { database, insertSpeed }
  const insertSpeedData = useMemo(
    () =>
      rows
        .map((r) => ({
          database: String(r?.strategy ?? ""),
          insertSpeed:
            r?.insert_speed_vecs_per_s == null
              ? null
              : Number(r.insert_speed_vecs_per_s),
        }))
        .filter((d) => d.database),
    [rows],
  );

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900">
      {/* ✅ container giống IndexingChunking: max-width + mx-auto + padding ngang */}
      <div className="mx-auto w-full max-w-[1700px] px-8 py-6 space-y-6">
        <VectorDatabaseHeader />

        {/* model switch quick (nếu bạn muốn đặt trong header thì mình có thể sửa header sau) */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Model:</span>
          <button
            className={`px-3 py-1 rounded border ${
              modelKey === "LLM" ? "bg-gray-900 text-white" : "bg-transparent"
            }`}
            onClick={() => setModelKey("LLM")}
            type="button"
          >
            LLM
          </button>
          <button
            className={`px-3 py-1 rounded border ${
              modelKey === "BGE" ? "bg-gray-900 text-white" : "bg-transparent"
            }`}
            onClick={() => setModelKey("BGE")}
            type="button"
          >
            BGE
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">
                Loading vector database data...
              </span>
            </div>
          </div>
        ) : err ? (
          <div className="text-sm text-red-600 dark:text-red-400">{err}</div>
        ) : !activeModel ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No data.
          </div>
        ) : !vectorDb ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No vector database data for <b>{modelKey}</b>. (Expected: models.
            {modelKey}.vector_database)
          </div>
        ) : (
          <>
            <DatabaseSummaryCards cards={cards as any} />
            <DatabaseComparisonTable databases={databases as any} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchLatencyChart data={searchLatencyData as any} />
              <RecallComparisonChart data={recallComparisonData as any} />
              <StorageCostChart data={storageCostData as any} />
              <InsertSpeedChart data={insertSpeedData as any} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
