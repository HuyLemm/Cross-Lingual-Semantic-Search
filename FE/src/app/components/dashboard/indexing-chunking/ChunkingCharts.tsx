import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ===== Types =====
export interface ChunkSizeAccuracy {
  size: number;
  recall: number | null;
  precision: number | null;
  f1: number | null;
}

export interface IndexingStrategy {
  name: string;
  memory: number | null;
  recall: number | null;
}

export interface ChunkingStrategy {
  name: string;
  avgChunks: number;
  recall: number | null;
  overlap: number; // 0..1
  coherence: number | null;
  notes?: string;
}

type BundleModel = {
  chunkingStrategies?: ChunkingStrategy[];
};

interface ChunkingChartsProps {
  modelKey?: 'LLM' | 'BGE';

  // chart chunk-size (nếu có)
  chunkSizeData: ChunkSizeAccuracy[];

  // indexing strategies của model đang hiển thị (phần phải)
  indexingStrategies: IndexingStrategy[];

  // ✅ cả 2 model để làm bảng so sánh chunking (LLM vs BGE)
  models?: {
    LLM?: BundleModel;
    BGE?: BundleModel;
  } | null;
}

function isNonEmptyArray(a: any[]) {
  return Array.isArray(a) && a.length > 0;
}

function fmtPct(v: number | null | undefined, digits = 1) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return `${(v * 100).toFixed(digits)}%`;
}

function fmtNum(v: number | null | undefined, digits = 2) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return v.toFixed(digits);
}

function fmtInt(v: number | null | undefined) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return Math.round(v).toLocaleString();
}

export default function ChunkingCharts({ modelKey, chunkSizeData, indexingStrategies, models }: ChunkingChartsProps) {
  // ===== sanitize chunk curve =====
  const chunkClean = (chunkSizeData || [])
    .map((d) => ({
      size: Number(d.size),
      recall: d.recall == null ? null : Number(d.recall),
      precision: d.precision == null ? null : Number(d.precision),
      f1: d.f1 == null ? null : Number(d.f1),
    }))
    .filter((d) => Number.isFinite(d.size));

  const hasChunk = isNonEmptyArray(chunkClean);

  // dynamic y domain for chunk curve
  const vals = chunkClean
    .flatMap((d) => [d.recall, d.precision, d.f1])
    .filter((v) => typeof v === 'number') as number[];
  const minV = vals.length ? Math.max(0, Math.min(...vals) - 0.03) : 0.7;
  const maxV = vals.length ? Math.min(1, Math.max(...vals) + 0.03) : 0.9;

  // ===== sanitize indexing strategies for RIGHT panel =====
  const idxClean = (indexingStrategies || [])
    .map((s) => ({
      name: String(s.name ?? ''),
      memory: s.memory == null ? null : Number(s.memory),
      recall: s.recall == null ? null : Number(s.recall),
    }))
    .filter((s) => s.name);

  const hasIdx = isNonEmptyArray(idxClean);

  // ===== LEFT panel: Delta table from models.LLM.chunkingStrategies vs models.BGE.chunkingStrategies =====
  const llmRows = (models?.LLM?.chunkingStrategies ?? []).filter((r) => r?.name);
  const bgeRows = (models?.BGE?.chunkingStrategies ?? []).filter((r) => r?.name);

  const llmMap = new Map(llmRows.map((r) => [r.name, r]));
  const bgeMap = new Map(bgeRows.map((r) => [r.name, r]));

  const allNames = Array.from(new Set([...llmRows.map((r) => r.name), ...bgeRows.map((r) => r.name)])).sort();

  const deltaRows = allNames.map((name) => {
    const L = llmMap.get(name);
    const B = bgeMap.get(name);

    const llmRecall = L?.recall ?? null;
    const bgeRecall = B?.recall ?? null;

    const llmCoh = L?.coherence ?? null;
    const bgeCoh = B?.coherence ?? null;

    const dRecall =
      typeof llmRecall === 'number' && typeof bgeRecall === 'number' ? bgeRecall - llmRecall : null;
    const dCoh = typeof llmCoh === 'number' && typeof bgeCoh === 'number' ? bgeCoh - llmCoh : null;

    return {
      name,
      llmAvg: L?.avgChunks ?? null,
      bgeAvg: B?.avgChunks ?? null,
      llmRecall,
      bgeRecall,
      dRecall,
      llmCoh,
      bgeCoh,
      dCoh,
    };
  });

  const hasDelta = isNonEmptyArray(deltaRows) && (isNonEmptyArray(llmRows) || isNonEmptyArray(bgeRows));

  const renderDeltaBadge = (delta: number | null, pct = true) => {
    if (typeof delta !== 'number' || !Number.isFinite(delta)) return null;
    const good = delta >= 0;
    const text = pct ? `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}%` : `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`;
    return (
      <Badge
        variant="outline"
        className={good ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}
      >
        {text}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Curve OR Delta Table */}
      <Card>
        <CardHeader>
          <CardTitle>{hasChunk ? 'Accuracy vs Chunk Size' : 'Chunking LLM vs BGE (Delta)'}</CardTitle>
        </CardHeader>

        <CardContent>
          {hasChunk ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chunkClean}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="size"
                  label={{ value: 'Chunk Size (tokens)', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(v) => (typeof v === 'number' ? `${v}` : '')}
                />
                <YAxis domain={[minV, maxV]} tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(2) : '')} />
                <Tooltip
                  labelFormatter={(label) => `Chunk size: ${label}`}
                  formatter={(value, name) => {
                    const v = typeof value === 'number' ? value : Number(value);
                    return Number.isFinite(v) ? [`${(v * 100).toFixed(2)}%`, String(name)] : ['—', String(name)];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="recall" stroke="#3b82f6" strokeWidth={2} name="Recall" dot={false} />
                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} name="Precision" dot={false} />
                <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} name="F1-Score" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : !hasDelta ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              No chunk-size curve and no LLM/BGE chunking data to compare.
            </div>
          ) : (
            <div className="max-h-[320px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Recall (LLM)</TableHead>
                    <TableHead className="text-right">Recall (BGE)</TableHead>
                    <TableHead className="text-right">Δ Recall</TableHead>
                    <TableHead className="text-right">Coh (LLM)</TableHead>
                    <TableHead className="text-right">Coh (BGE)</TableHead>
                    <TableHead className="text-right">Δ Coh</TableHead>
                    <TableHead className="text-right">AvgChunks (LLM/BGE)</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {deltaRows.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>

                      <TableCell className="text-right">{fmtPct(r.llmRecall)}</TableCell>
                      <TableCell className="text-right">{fmtPct(r.bgeRecall)}</TableCell>
                      <TableCell className="text-right">{renderDeltaBadge(r.dRecall, true) ?? '—'}</TableCell>

                      <TableCell className="text-right">{fmtNum(r.llmCoh, 2)}</TableCell>
                      <TableCell className="text-right">{fmtNum(r.bgeCoh, 2)}</TableCell>
                      <TableCell className="text-right">
                        {renderDeltaBadge(r.dCoh, false) ?? '—'}
                      </TableCell>

                      <TableCell className="text-right">
                        {fmtInt(r.llmAvg)} / {fmtInt(r.bgeAvg)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Δ Recall = BGE − LLM (positive is better). Δ Coh = BGE − LLM.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RIGHT: Memory vs Recall Tradeoff */}
      <Card>
        <CardHeader>
          <CardTitle>Memory vs Recall Trade-off{modelKey ? ` (${modelKey})` : ''}</CardTitle>
        </CardHeader>

        <CardContent>
          {!hasIdx ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              No indexing strategy data.
            </div>
          ) : (
            <div className="space-y-4">
              {idxClean.map((strategy) => {
                const recallPct =
                  typeof strategy.recall === 'number' ? Math.max(0, Math.min(100, strategy.recall * 100)) : null;
                const memText = typeof strategy.memory === 'number' ? `${strategy.memory.toFixed(2)} GB` : '—';
                const recallText = recallPct == null ? '—' : `${recallPct.toFixed(1)}% recall`;

                return (
                  <div key={strategy.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{strategy.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {memText} / {recallText}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                        style={{ width: `${recallPct ?? 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}