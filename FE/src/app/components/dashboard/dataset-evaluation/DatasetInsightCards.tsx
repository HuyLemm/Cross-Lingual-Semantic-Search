import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { TrendingUp, Minus } from 'lucide-react';

interface InsightData {
  bestLanguage: {
    language: string;
    model: string;
    verifiedRatio: number;
  };
  highestSimilarity: {
    language: string;
    model: string;
    avgSimilarity: number;
  };
  strongestEntailment: {
    language: string;
    model: string;
    avgEntailment: number;
  };
}

interface DatasetInsightCardsProps {
  insights: InsightData | null;
}

export default function DatasetInsightCards({ insights }: DatasetInsightCardsProps) {
  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Best Verified Dataset */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-5">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
            Highest Verification Reliability
          </p>

          <div className="flex items-baseline gap-2 mt-2">
            <Badge variant="outline" className="font-mono text-lg">
              {insights.bestLanguage.language}
            </Badge>
            <span className="text-sm text-gray-500">
              ({insights.bestLanguage.model})
            </span>
          </div>

          <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {(insights.bestLanguage.verifiedRatio * 100).toFixed(1)}% Verified
          </p>
        </CardContent>
      </Card>

      {/* Strongest Semantic Quality */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-5">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
            Strongest Semantic Similarity
          </p>

          <div className="flex items-baseline gap-2 mt-2">
            <Badge variant="outline" className="font-mono text-lg">
              {insights.highestSimilarity.language}
            </Badge>
            <span className="text-sm text-gray-500">
              ({insights.highestSimilarity.model})
            </span>
          </div>

          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium flex items-center gap-1">
            <Minus className="w-4 h-4" />
            {insights.highestSimilarity.avgSimilarity.toFixed(3)}
          </p>
        </CardContent>
      </Card>

      {/* Strongest Logical Correctness */}
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-5">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
            Strongest Entailment Correctness
          </p>

          <div className="flex items-baseline gap-2 mt-2">
            <Badge variant="outline" className="font-mono text-lg">
              {insights.strongestEntailment.language}
            </Badge>
            <span className="text-sm text-gray-500">
              ({insights.strongestEntailment.model})
            </span>
          </div>

          <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium flex items-center gap-1">
            <Minus className="w-4 h-4" />
            {insights.strongestEntailment.avgEntailment.toFixed(3)}
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
