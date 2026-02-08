import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IntraCrossLingualChartsProps {
  intraLingualData: any[];
  crossLingualData: any[];
}

export default function IntraCrossLingualCharts({ intraLingualData, crossLingualData }: IntraCrossLingualChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Intra-Language Similarity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={intraLingualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="en" fill="#3b82f6" name="EN" />
              <Bar dataKey="vi" fill="#10b981" name="VI" />
              <Bar dataKey="zh" fill="#f59e0b" name="ZH" />
              <Bar dataKey="es" fill="#8b5cf6" name="ES" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cross-Language Similarity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={crossLingualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="envi" fill="#06b6d4" name="EN-VI" />
              <Bar dataKey="enzh" fill="#ec4899" name="EN-ZH" />
              <Bar dataKey="enes" fill="#14b8a6" name="EN-ES" />
              <Bar dataKey="vizh" fill="#f97316" name="VI-ZH" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
