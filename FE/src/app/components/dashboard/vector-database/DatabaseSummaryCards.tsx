import { Card, CardContent } from '../../ui/card';

type VectorDbCards = {
  best_recall: number; // 0..1
  fastest_insert_vecs_per_s: number;
  lowest_latency_ms: number;
  lowest_storage_gb: number;
};

interface Props {
  cards: VectorDbCards;
}

function gbToMb(gb: number) {
  return gb * 1024;
}

function fmtNumber(v: number, digits = 2) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return v.toFixed(digits);
}

export default function DatabaseSummaryCards({ cards }: Props) {
  const bestRecallPct =
    typeof cards.best_recall === 'number' && Number.isFinite(cards.best_recall)
      ? (cards.best_recall * 100).toFixed(1)
      : '—';

  const lowestStorageMb =
    typeof cards.lowest_storage_gb === 'number' && Number.isFinite(cards.lowest_storage_gb)
      ? gbToMb(cards.lowest_storage_gb)
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Fastest Insert</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {typeof cards.fastest_insert_vecs_per_s === 'number' && Number.isFinite(cards.fastest_insert_vecs_per_s)
              ? `${Math.round(cards.fastest_insert_vecs_per_s).toLocaleString()} vecs/s`
              : '—'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lowest Latency</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {typeof cards.lowest_latency_ms === 'number' && Number.isFinite(cards.lowest_latency_ms)
              ? `${fmtNumber(cards.lowest_latency_ms, 4)} ms`
              : '—'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Best Recall</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">{bestRecallPct === '—' ? '—' : `${bestRecallPct}%`}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lowest Storage</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {lowestStorageMb == null ? '—' : `${fmtNumber(lowestStorageMb, 2)} MB`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}