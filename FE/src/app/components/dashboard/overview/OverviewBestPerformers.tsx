import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { TrendingUp, Brain, Zap, Languages } from 'lucide-react';

const bestPerformers = [
  {
    icon: TrendingUp,
    title: 'Best Model',
    model: 'BGE-M3',
    metrics: [
      { label: 'Recall@10', value: '91.2%' },
      { label: 'MRR', value: '0.76' },
    ],
  },
  {
    icon: Brain,
    title: 'Best Combo',
    model: 'BGE-M3 + CrossEncoder',
    metrics: [
      { label: 'Recall@10', value: '94.5%' },
      { label: 'Latency', value: '+12ms' },
    ],
  },
  {
    icon: Zap,
    title: 'Fastest Index',
    model: 'FAISS-IVF',
    metrics: [
      { label: 'Build', value: '23s' },
      { label: 'Query', value: '8.2ms' },
    ],
  },
  {
    icon: Languages,
    title: 'Best Multilingual',
    model: 'LaBSE',
    metrics: [
      { label: 'Cross-lingual', value: '85.3%' },
      { label: '12 languages', value: '' },
    ],
  },
];

export default function OverviewBestPerformers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {bestPerformers.map((performer, idx) => {
        const Icon = performer.icon;
        return (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Icon className="w-4 h-4 mr-2" />
                {performer.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{performer.model}</p>
              {performer.metrics.map((metric, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}: {metric.value}
                </p>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
