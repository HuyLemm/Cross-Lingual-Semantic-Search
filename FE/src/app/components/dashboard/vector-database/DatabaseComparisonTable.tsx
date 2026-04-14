import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";

export type VectorDbRow = {
  // từ API
  strategy: string;
  insert_speed_vecs_per_s: number;
  search_latency_ms: number;
  recall_at_10: number;
  storage_gb: number;

  // optional
  features?: string[];
};

interface DatabaseComparisonTableProps {
  databases: VectorDbRow[];
}

function gbToMb(gb: number) {
  return gb * 1024;
}

function safeNum(v: any): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function DatabaseComparisonTable({
  databases,
}: DatabaseComparisonTableProps) {
  const rows = (databases || [])
    .map((r) => ({
      strategy: String(r.strategy ?? ""),
      insert: safeNum(r.insert_speed_vecs_per_s) ?? 0,
      latency: safeNum(r.search_latency_ms) ?? 0,
      recall: safeNum(r.recall_at_10) ?? 0,
      storageGb: safeNum(r.storage_gb) ?? 0,
      features: Array.isArray(r.features) ? r.features : [],
    }))
    .filter((r) => r.strategy);

  // pick bests (relative highlight)
  const maxInsert = rows.length ? Math.max(...rows.map((r) => r.insert)) : null;
  const minLatency = rows.length
    ? Math.min(...rows.map((r) => r.latency))
    : null;
  const maxRecall = rows.length ? Math.max(...rows.map((r) => r.recall)) : null;
  const minStorage = rows.length
    ? Math.min(...rows.map((r) => r.storageGb))
    : null;

  const mkFeatures = (strategy: string) => {
    // ✅ nếu API chưa có features thì auto gợi ý theo strategy
    const s = strategy.toLowerCase();
    if (s.includes("flat")) return ["Exact search", "Highest recall", "Simple"];
    if (s.includes("ivf") && s.includes("pq"))
      return ["Compressed", "Fast", "Large-scale"];
    if (s.includes("ivf")) return ["Inverted lists", "Balanced", "ANN"];
    if (s.includes("hnsw")) return ["Graph ANN", "Low latency", "Good recall"];
    if (s.includes("pq")) return ["Quantized", "Low memory", "Compression"];
    return ["Vector index"];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Index (FAISS) Comparison</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">
                Insert Speed (vecs/s)
              </TableHead>
              <TableHead className="text-right">Search Latency (ms)</TableHead>
              <TableHead className="text-right">Recall@10</TableHead>
              <TableHead className="text-right">Storage (MB)</TableHead>
              <TableHead className="text-right">Key Features</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r) => {
              const isBestInsert = maxInsert != null && r.insert === maxInsert;
              const isBestLatency =
                minLatency != null && r.latency === minLatency;
              const isBestRecall = maxRecall != null && r.recall === maxRecall;
              const isBestStorage =
                minStorage != null && r.storageGb === minStorage;

              const features = r.features.length
                ? r.features
                : mkFeatures(r.strategy);

              return (
                <TableRow key={r.strategy}>
                  <TableCell className="font-medium">{r.strategy}</TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        isBestInsert
                          ? "text-green-600 dark:text-green-400 font-semibold"
                          : ""
                      }
                    >
                      {Math.round(r.insert).toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        isBestLatency
                          ? "text-green-600 dark:text-green-400 font-semibold"
                          : ""
                      }
                    >
                      {r.latency.toFixed(4)}ms
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        isBestRecall
                          ? "text-green-600 dark:text-green-400 font-semibold"
                          : ""
                      }
                    >
                      {(r.recall * 100).toFixed(1)}%
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        isBestStorage
                          ? "text-green-600 dark:text-green-400 font-semibold"
                          : ""
                      }
                    >
                      {gbToMb(r.storageGb).toFixed(2)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="text-right">
                      {features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {!rows.length && (
          <div className="py-10 text-center text-sm text-gray-600 dark:text-gray-400">
            No vector index rows.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
