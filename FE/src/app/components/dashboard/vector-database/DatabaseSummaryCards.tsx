import { Card, CardContent } from '@/app/components/ui/card';

export default function DatabaseSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Fastest Insert</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">12.4K vecs/s</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lowest Latency</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">8.2ms</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Best Recall</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Milvus</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">97%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lowest Storage</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">FAISS</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">2.4 GB</p>
        </CardContent>
      </Card>
    </div>
  );
}
