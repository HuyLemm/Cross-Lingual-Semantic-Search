import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PCAVisualizationProps {
  pcaData: any[];
}

export default function PCAVisualization({ pcaData }: PCAVisualizationProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Embedding Space Visualization (PCA)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="PC1" domain={[-3, 3]} label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -5 }} />
            <YAxis type="number" dataKey="y" name="PC2" domain={[-3, 3]} label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="EN-Technical" data={pcaData.filter(d => d.cluster === 'EN-Technical')} fill="#3b82f6" />
            <Scatter name="VI-Technical" data={pcaData.filter(d => d.cluster === 'VI-Technical')} fill="#10b981" />
            <Scatter name="EN-General" data={pcaData.filter(d => d.cluster === 'EN-General')} fill="#8b5cf6" />
            <Scatter name="ZH-Technical" data={pcaData.filter(d => d.cluster === 'ZH-Technical')} fill="#f59e0b" />
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Embeddings projected to 2D using PCA. Clear clustering indicates good semantic separation.
        </p>
      </CardContent>
    </Card>
  );
}
