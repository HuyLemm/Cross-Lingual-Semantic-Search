import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChunkSizeAccuracy, IndexingStrategy } from './indexingChunkingData';

interface ChunkingChartsProps {
  chunkSizeData: ChunkSizeAccuracy[];
  indexingStrategies: IndexingStrategy[];
}

export default function ChunkingCharts({ chunkSizeData, indexingStrategies }: ChunkingChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Accuracy vs Chunk Size */}
      <Card>
        <CardHeader>
          <CardTitle>Accuracy vs Chunk Size</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chunkSizeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="size" 
                label={{ value: 'Chunk Size (tokens)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis domain={[0.7, 0.9]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="recall" stroke="#3b82f6" strokeWidth={2} name="Recall" />
              <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} name="Precision" />
              <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} name="F1-Score" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Memory vs Recall Tradeoff */}
      <Card>
        <CardHeader>
          <CardTitle>Memory vs Recall Trade-off</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {indexingStrategies.map((strategy) => (
              <div key={strategy.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{strategy.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {strategy.memory} GB / {(strategy.recall * 100).toFixed(1)}% recall
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                    style={{ width: `${strategy.recall * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
