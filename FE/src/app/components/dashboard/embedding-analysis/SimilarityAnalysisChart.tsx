import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimilarityAnalysisChartProps {
  similarityData: any[];
}

export default function SimilarityAnalysisChart({ similarityData }: SimilarityAnalysisChartProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Cosine Similarity Analysis</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={similarityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pair" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="bge" fill="#3b82f6" name="BGE-M3" />
            <Bar dataKey="me5" fill="#10b981" name="mE5-large" />
            <Bar dataKey="labse" fill="#8b5cf6" name="LaBSE" />
            <Bar dataKey="muse" fill="#f59e0b" name="mUSE" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Q-D = Query-Document, D-D = Document-Document similarity scores
        </p>
      </CardContent>
    </Card>
  );
}
