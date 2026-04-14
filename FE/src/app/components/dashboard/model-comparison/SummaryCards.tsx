import { Card, CardContent } from '../../ui/card';
import { TrendingUp, Zap, DollarSign, Clock } from 'lucide-react';

type SummaryCardsProps = {
  qualityGainText?: string;
  speedCostText?: string;
  rerankerBoostText?: string;
  efficiencyRatioText?: string;
};

export default function SummaryCards({
  qualityGainText,
  speedCostText,
  rerankerBoostText,
  efficiencyRatioText,
}: SummaryCardsProps) {

  const cards = [
    {
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      title: "QUALITY GAIN",
      value: qualityGainText,
      subtitle: "Avg Improvement"
    },
    {
      icon: <Zap className="w-5 h-5 text-purple-600" />,
      title: "RERANKER BOOST",
      value: rerankerBoostText,
      subtitle: "Median Improvement"
    },
    {
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      title: "SPEED COST",
      value: speedCostText,
      subtitle: "Additional Latency"
    },
    {
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
      title: "QUALITY / SPEED",
      value: efficiencyRatioText,
      subtitle: "Efficiency Ratio"
    },
  ].filter(c => c.value && c.value !== "—");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-2">
              {c.icon}
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              {c.title}
            </p>

            <p className="text-2xl font-bold">
              {c.value}
            </p>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {c.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}