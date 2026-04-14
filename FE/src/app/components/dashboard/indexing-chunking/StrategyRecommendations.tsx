import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

type IndexingStrategy = {
  name: string;
  queryLatency: number | null;
  recall: number | null;
  memory: number | null;
};

type ChunkingStrategy = {
  name: string;
  recall: number | null;
  coherence: number | null;
};

interface StrategyRecommendationsProps {
  modelKey?: 'LLM' | 'BGE';
  indexingStrategies: IndexingStrategy[];
  chunkingStrategies: ChunkingStrategy[];
}

function pickMin<T>(arr: T[], get: (x: T) => number | null | undefined) {
  let best: T | null = null;
  let bestVal = Infinity;
  for (const x of arr) {
    const v = get(x);
    if (typeof v === 'number' && Number.isFinite(v) && v < bestVal) {
      bestVal = v;
      best = x;
    }
  }
  return { best, bestVal: best ? bestVal : null };
}

function pickMax<T>(arr: T[], get: (x: T) => number | null | undefined) {
  let best: T | null = null;
  let bestVal = -Infinity;
  for (const x of arr) {
    const v = get(x);
    if (typeof v === 'number' && Number.isFinite(v) && v > bestVal) {
      bestVal = v;
      best = x;
    }
  }
  return { best, bestVal: best ? bestVal : null };
}

function fmtMs(v: number | null) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return `${v.toFixed(v < 10 ? 2 : 1)}ms`;
}
function fmtPct(v: number | null, digits = 1) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return `${(v * 100).toFixed(digits)}%`;
}

export default function StrategyRecommendations({
  modelKey,
  indexingStrategies,
  chunkingStrategies,
}: StrategyRecommendationsProps) {
  const idx = (indexingStrategies || []).map((s) => ({
    ...s,
    name: String(s.name ?? ''),
    queryLatency: s.queryLatency == null ? null : Number(s.queryLatency),
    recall: s.recall == null ? null : Number(s.recall),
  })).filter(s => s.name);

  const chk = (chunkingStrategies || []).map((s) => ({
    ...s,
    name: String(s.name ?? ''),
    recall: s.recall == null ? null : Number(s.recall),
    coherence: s.coherence == null ? null : Number(s.coherence),
  })).filter(s => s.name);

  // For Speed: min latency
  const { best: bestSpeed, bestVal: bestLatency } = pickMin(idx, (s) => s.queryLatency);

  // For Accuracy: max recall (indexing) + max recall (chunking); fallback chunking by coherence
  const { best: bestIdxAcc, bestVal: bestIdxRecall } = pickMax(idx, (s) => s.recall);
  const { best: bestChkAcc, bestVal: bestChkRecall } = pickMax(chk, (s) => s.recall);
  const { best: bestChkCoh } = pickMax(chk, (s) => s.coherence);

  // Balanced: choose strategy with good recall + low latency via simple score
  // score = recall - alpha * latency (normalize latency roughly)
  const alpha = 0.02;
  let bestBalanced: IndexingStrategy | null = null;
  let bestScore = -Infinity;
  for (const s of idx) {
    const r = s.recall;
    const l = s.queryLatency;
    if (typeof r !== 'number' || !Number.isFinite(r)) continue;
    const penalty = typeof l === 'number' && Number.isFinite(l) ? alpha * (l / 10) : alpha;
    const score = r - penalty;
    if (score > bestScore) {
      bestScore = score;
      bestBalanced = s;
    }
  }

  const speedText =
    bestSpeed?.name ? `${bestSpeed.name}${modelKey ? ` (${modelKey})` : ''}` : '—';
  const speedBadge =
    bestLatency != null ? `${fmtMs(bestLatency)} latency` : '—';

  const accChunkName =
    bestChkAcc?.name || bestChkCoh?.name || '—';
  const accIndexName =
    bestIdxAcc?.name || '—';

  const accLabel =
    accIndexName !== '—' && accChunkName !== '—'
      ? `${accIndexName} + ${accChunkName}`
      : accIndexName !== '—'
        ? accIndexName
        : accChunkName;

  const accBadge =
    bestIdxRecall != null
      ? `${fmtPct(bestIdxRecall, 1)} recall`
      : bestChkRecall != null
        ? `${fmtPct(bestChkRecall, 1)} recall`
        : '—';

  const balancedName =
    bestBalanced?.name ? `${bestBalanced.name} + ${accChunkName}` : '—';

  const balancedBadge =
    bestBalanced?.queryLatency != null && bestBalanced?.recall != null
      ? `${fmtMs(bestBalanced.queryLatency)} / ${fmtPct(bestBalanced.recall, 1)}`
      : bestBalanced?.recall != null
        ? `${fmtPct(bestBalanced.recall, 1)} recall`
        : '—';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">For Speed</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{speedText}</p>
              <Badge variant="outline" className="mt-2">{speedBadge}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">For Accuracy</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{accLabel}</p>
              <Badge variant="outline" className="mt-2">{accBadge}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Balanced</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{balancedName}</p>
              <Badge variant="outline" className="mt-2">{balancedBadge}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}