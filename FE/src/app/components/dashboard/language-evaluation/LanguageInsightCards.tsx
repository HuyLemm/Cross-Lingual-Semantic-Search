import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InsightData {
  bestLang: {
    language: string;
    successRate: number;
    model: string;
  };
  bestCrossLingual: {
    pair: string;
    retrievalAccuracy: number;
    model: string;
  };
  worstCrossLingual: {
    pair: string;
    retrievalAccuracy: number;
    model: string;
  };
  mostStable: {
    model: string;
    avgScore: number;
    stdDev: number;
  };
}

interface LanguageInsightCardsProps {
  insights: InsightData;
}

export default function LanguageInsightCards({ insights }: LanguageInsightCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Best Performing Language
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <Badge variant="outline" className="font-mono text-lg">{insights.bestLang.language}</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({insights.bestLang.model})
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {(insights.bestLang.successRate * 100).toFixed(1)}% Success Rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Most Reliable Cross-Lingual Pair
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.bestCrossLingual.pair}
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {(insights.bestCrossLingual.retrievalAccuracy * 100).toFixed(1)}% Accuracy
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {insights.bestCrossLingual.model}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Most Challenging Language Pair
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.worstCrossLingual.pair}
                </span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-medium flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                {(insights.worstCrossLingual.retrievalAccuracy * 100).toFixed(1)}% Accuracy
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {insights.worstCrossLingual.model}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Most Stable Model Across Languages
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.mostStable.model.split(' ')[0]}
                </span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium flex items-center gap-1">
                <Minus className="w-4 h-4" />
                σ = {(insights.mostStable.stdDev * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg: {(insights.mostStable.avgScore * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
