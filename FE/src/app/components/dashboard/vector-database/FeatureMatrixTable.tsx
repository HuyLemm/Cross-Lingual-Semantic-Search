import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function FeatureMatrixTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Feature</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">FAISS</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Milvus</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Qdrant</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Weaviate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Distributed Architecture</td>
                <td className="text-center py-3 px-4">❌</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">GPU Acceleration</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">❌</td>
                <td className="text-center py-3 px-4">❌</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Metadata Filtering</td>
                <td className="text-center py-3 px-4">❌</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Hybrid Search</td>
                <td className="text-center py-3 px-4">❌</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Cloud Native</td>
                <td className="text-center py-3 px-4">❌</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Open Source</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
