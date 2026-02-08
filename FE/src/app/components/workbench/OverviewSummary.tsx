import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

export default function OverviewSummary() {
  // Mock data for summary visualizations
  const modelComparisonData = [
    { model: 'BGE-M3', recall: 0.91, mrr: 0.76, latency: 45 },
    { model: 'mE5-large', recall: 0.88, mrr: 0.73, latency: 38 },
    { model: 'LaBSE', recall: 0.85, mrr: 0.70, latency: 32 },
    { model: 'mUSE', recall: 0.81, mrr: 0.65, latency: 28 },
  ];

  const metricsOverKData = [
    { k: 1, recall: 0.65, mrr: 0.65 },
    { k: 3, recall: 0.73, mrr: 0.71 },
    { k: 5, recall: 0.82, mrr: 0.74 },
    { k: 10, recall: 0.91, mrr: 0.76 },
    { k: 20, recall: 0.95, mrr: 0.77 },
  ];

  const experimentSummary = [
    { runId: 'EXP-001', model: 'BGE-M3', dataset: 'arxiv-multilingual', recall: 0.91, mrr: 0.76, latency: 45 },
    { runId: 'EXP-002', model: 'mE5-large', dataset: 'arxiv-multilingual', recall: 0.88, mrr: 0.73, latency: 38 },
    { runId: 'EXP-003', model: 'LaBSE', dataset: 'wiki-qa', recall: 0.85, mrr: 0.70, latency: 32 },
    { runId: 'EXP-004', model: 'BGE-M3', dataset: 'thesis-corpus', recall: 0.89, mrr: 0.74, latency: 42 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Evaluation Overview</h2>
        <p className="text-sm text-gray-600 dark:text-slate-400">High-level summary of retrieval performance across all experimental runs.</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardContent className="p-6">
            <div className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">Total Experiments</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-slate-100">12</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardContent className="p-6">
            <div className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">Highest Observed Recall@10</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-slate-100">0.91</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardContent className="p-6">
            <div className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">Highest Observed MRR</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-slate-100">0.76</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
          <CardContent className="p-6">
            <div className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">Lowest Latency</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-slate-100">28ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Model Comparison Chart */}
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-slate-100">Model Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis dataKey="model" tick={{ fontSize: 12 }} className="dark:fill-slate-300" />
              <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} className="dark:fill-slate-300" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="recall" fill="#475569" name="Recall@10" />
              <Bar dataKey="mrr" fill="#64748b" name="MRR" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Over K */}
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-slate-100">Metrics vs Top-K</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsOverKData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis dataKey="k" label={{ value: 'K', position: 'insideBottom', offset: -5, fontSize: 12 }} tick={{ fontSize: 12 }} className="dark:fill-slate-300" />
              <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} className="dark:fill-slate-300" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="recall" stroke="#475569" strokeWidth={2} name="Recall@K" />
              <Line type="monotone" dataKey="mrr" stroke="#64748b" strokeWidth={2} name="MRR" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Experiment History Table */}
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-slate-100">Recent Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-gray-700 dark:text-slate-400">Run ID</TableHead>
                <TableHead className="text-xs uppercase text-gray-700 dark:text-slate-400">Model</TableHead>
                <TableHead className="text-xs uppercase text-gray-700 dark:text-slate-400">Dataset</TableHead>
                <TableHead className="text-xs uppercase text-right text-gray-700 dark:text-slate-400">Recall@10</TableHead>
                <TableHead className="text-xs uppercase text-right text-gray-700 dark:text-slate-400">MRR</TableHead>
                <TableHead className="text-xs uppercase text-right text-gray-700 dark:text-slate-400">Latency (ms)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experimentSummary.map((exp) => (
                <TableRow key={exp.runId} className="dark:border-slate-700">
                  <TableCell className="font-mono text-sm text-gray-900 dark:text-slate-200">{exp.runId}</TableCell>
                  <TableCell className="text-sm text-gray-900 dark:text-slate-200">{exp.model}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-slate-400">{exp.dataset}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-gray-900 dark:text-slate-200">{exp.recall.toFixed(3)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-gray-900 dark:text-slate-200">{exp.mrr.toFixed(3)}</TableCell>
                  <TableCell className="text-right text-sm text-gray-900 dark:text-slate-200">{exp.latency}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-slate-100">Key Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
            <p>• BGE-M3 achieves the highest recall (0.91) and MRR (0.76) across all tested models.</p>
            <p>• Recall@10 shows diminishing returns after K=10, suggesting optimal retrieval depth.</p>
            <p>• Average latency of 38ms indicates real-time performance for most use cases.</p>
            <p>• Cross-lingual experiments show 15-20% lower performance compared to monolingual retrieval.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}