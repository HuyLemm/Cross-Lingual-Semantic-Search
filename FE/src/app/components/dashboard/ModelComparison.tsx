import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/badge';

import SummaryCards from './model-comparison/SummaryCards';
import MetricsTable from './model-comparison/MetricsTable';
import Charts from './model-comparison/Charts';
import Recommendations from './model-comparison/Recommendations';

type SummaryCardsData = {
  qualityGainText: string;
  speedCostText: string;
  rerankerBoostText: string;
  efficiencyRatioText: string;
};

const API_BASE = 'http://localhost:4000';

export default function Comparison() {
  const [summaryCards, setSummaryCards] = useState<SummaryCardsData>({
    qualityGainText: '—',
    speedCostText: '—',
    rerankerBoostText: '—',
    efficiencyRatioText: '—',
  });

  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoadingSummary(true);

        const res = await fetch(`${API_BASE}/model/model-comparison`, {
          method: 'GET',
        });
        const json = await res.json();

        console.log('model-comparison:', json);

        if (!alive) return;

        if (json?.ok && json?.summaryCards) {
          setSummaryCards({
            qualityGainText: json.summaryCards.qualityGainText ?? '—',
            speedCostText: json.summaryCards.speedCostText ?? '—',
            rerankerBoostText: json.summaryCards.rerankerBoostText ?? '—',
            efficiencyRatioText: json.summaryCards.efficiencyRatioText ?? '—',
          });
        } else {
          setSummaryCards({
            qualityGainText: '—',
            speedCostText: '—',
            rerankerBoostText: '—',
            efficiencyRatioText: '—',
          });
        }
      } catch (e) {
        if (!alive) return;

        setSummaryCards({
          qualityGainText: '—',
          speedCostText: '—',
          rerankerBoostText: '—',
          efficiencyRatioText: '—',
        });
      } finally {
        if (!alive) return;
        setLoadingSummary(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  const headerRight = useMemo(() => {
    return (
      <div className="flex items-center space-x-2 flex-wrap justify-end">
        <Badge className="bg-blue-600 text-white">MiniLM</Badge>
        <span className="text-gray-400">vs</span>
        <Badge className="bg-purple-600 text-white">BGE</Badge>
        <span className="text-gray-400 ml-2">|</span>
        <Badge className="bg-slate-700 text-white">DeepSeek</Badge>
        <Badge className="bg-emerald-600 text-white">Gemini</Badge>
        <Badge className="bg-rose-600 text-white">GPT</Badge>
      </div>
    );
  }, []);

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Comparative Analysis: MiniLM vs BGE across DeepSeek, Gemini, and GPT
            </h2>
            {headerRight}
          </div>

          <p className="text-sm text-gray-600 dark:text-slate-400">
            Head-to-head comparison of MiniLM and BGE configurations across evaluation metrics,
            covering DeepSeek, Gemini, and GPT datasets.
          </p>
        </div>

        {/* Summary Cards */}
        <div className={loadingSummary ? 'opacity-60 pointer-events-none' : ''}>
          <SummaryCards
            qualityGainText={summaryCards.qualityGainText}
            speedCostText={summaryCards.speedCostText}
            rerankerBoostText={summaryCards.rerankerBoostText}
            efficiencyRatioText={summaryCards.efficiencyRatioText}
          />
        </div>

        {/* Metrics Table */}
        <MetricsTable
          title="Merged Results Table (DeepSeek/Gemini/GPT × τ)"
          endpoint={`${API_BASE}/model/model-comparison-metrics`}
        />

        {/* Charts Section */}
        <Charts
          endpoint={`${API_BASE}/model/model-comparison-charts`}
          titlePrefix="Charts"
        />

        {/* Recommendation Section */}
        <Recommendations />
      </div>
    </div>
  );
}