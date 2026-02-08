import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function ConfusionMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confusion Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div></div>
          <div className="text-center font-semibold text-gray-900 dark:text-white">Predicted Relevant</div>
          <div className="text-center font-semibold text-gray-900 dark:text-white">Predicted Not Relevant</div>
          
          <div className="font-semibold text-gray-900 dark:text-white flex items-center">Actually Relevant</div>
          <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">3,245</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">True Positive</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">342</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">False Negative</p>
          </div>
          
          <div className="font-semibold text-gray-900 dark:text-white flex items-center">Actually Not Relevant</div>
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">187</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">False Positive</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">68</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">True Negative</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Precision</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">94.5%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Recall</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">90.5%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">F1-Score</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">92.4%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
