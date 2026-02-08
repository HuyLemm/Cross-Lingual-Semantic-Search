import { Card, CardContent } from '@/app/components/ui/card';

export default function ErrorSummaryCards() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Error Analysis</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Identify and analyze retrieval failures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">726</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">18.9% of queries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">High Severity</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">89</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">12.3%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Medium Severity</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">390</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">53.7%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Low Severity</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">247</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">34.0%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">81.1%</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
