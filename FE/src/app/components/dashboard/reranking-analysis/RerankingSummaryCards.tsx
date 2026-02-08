import { Card, CardContent } from '@/app/components/ui/card';

export default function RerankingSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Recall Gain</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">+9.5%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">MRR Improvement</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">+0.11</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Latency Cost</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">+78ms</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Negative Cases</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">2.3%</p>
        </CardContent>
      </Card>
    </div>
  );
}
