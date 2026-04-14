// app/(whatever)/qa-eval/components/ModelSection.tsx
"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { ArrowUpRight, Filter } from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { ModelId, ModelSectionPayload } from "./qaEvalData";

interface ModelSectionProps {
  modelId: ModelId;
  data: ModelSectionPayload;
}

export default function ModelSection({ modelId, data }: ModelSectionProps) {
  const {
    name,
    verification,
    metrics,
    chartData,
    pieData,
    thresholdData,
    errorDistribution,
    tableData,
  } = data;

  const total = metrics.total || 0;

  const similarityRate =
    total === 0 ? "0.0" : ((metrics.passedSimilarity / total) * 100).toFixed(1);
  const entailmentRate =
    total === 0 ? "0.0" : ((metrics.passedEntailment / total) * 100).toFixed(1);
  const verifiedRate =
    total === 0 ? "0.0" : ((metrics.verified / total) * 100).toFixed(1);

  const renderCustomLabel = (entry: { value: number }) => {
    const percent = total === 0 ? 0 : (entry.value / total) * 100;
    return `${percent.toFixed(1)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 shadow-sm">
        <CardContent className="p-6">
          {/* Model Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {name}
              </h3>
              <Badge
                className="
    inline-flex items-center gap-1.5
    bg-purple-50 text-purple-700 border border-purple-200
    dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/40
    px-3 py-1 rounded-full text-sm font-semibold
    shadow-sm
  "
              >
                <Filter className="w-3.5 h-3.5" />
                All QA Included
                <span className="opacity-70">•</span>t ≥{" "}
                {Number(data.qualityThreshold ?? 0.7).toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* KPI Summary Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Total QA
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                {metrics.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                100%
              </p>
            </div>

            <div className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
              <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1 flex items-center">
                Similarity
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {metrics.passedSimilarity}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                {similarityRate}%
              </p>
            </div>

            <div className="p-5 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/30">
              <p className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wide mb-1 flex items-center">
                Entailment
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {metrics.passedEntailment}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                {entailmentRate}%
              </p>
            </div>

            <div className="p-5 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/30">
              <p className="text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1 flex items-center">
                Verified
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {metrics.verified}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                {verifiedRate}%
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* 1. Grouped Bar Chart - Performance by Language */}
            <Card className="border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Performance by Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="language"
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                      domain={[0, 1]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(value: number) => Number(value).toFixed(3)}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                    <Bar
                      dataKey="similarity"
                      fill="#3b82f6"
                      name="Similarity"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="entailment"
                      fill="#10b981"
                      name="Entailment"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="verifiedRatio"
                      fill="#a855f7"
                      name="Verified"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. Pie Chart - Validation Breakdown */}
            <Card className="border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Validation Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 3. Line Chart - Threshold Sensitivity */}
            <Card className="border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Threshold Sensitivity Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={thresholdData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="threshold"
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                      domain={[60, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                    <Line
                      type="monotone"
                      dataKey="verified"
                      stroke="#a855f7"
                      strokeWidth={2}
                      name="Verified Rate"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="similarity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Similarity"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="entailment"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Entailment"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4. Stacked Bar Chart - Error Distribution by Language */}
            <Card className="border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Error Distribution by Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={errorDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="language"
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
                    <Bar
                      dataKey="verified"
                      stackId="a"
                      fill="#a855f7"
                      name="Verified"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="simFail"
                      stackId="a"
                      fill="#3b82f6"
                      name="Similarity Fail"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="entFail"
                      stackId="a"
                      fill="#10b981"
                      name="Entailment Fail"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="bothFail"
                      stackId="a"
                      fill="#ef4444"
                      name="Both Fail"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Table Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3">
              Language Distribution Details
            </h4>
            <div className="overflow-hidden border border-gray-200 dark:border-slate-700 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      Language
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      QA Count
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      Avg Similarity
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      Avg Entailment
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      Verified %
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      Step1 Only %
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-slate-300 font-semibold">
                      Failed %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-850">
                  {tableData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded border border-gray-300 dark:border-slate-600 font-mono text-xs text-gray-700 dark:text-slate-300">
                          {row.language}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-gray-900 dark:text-slate-100">
                        {row.qaCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-blue-700 dark:text-blue-400 font-semibold">
                        {row.avgSimilarity.toFixed(3)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-green-700 dark:text-green-400 font-semibold">
                        {row.avgEntailment.toFixed(3)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/20 font-mono text-xs font-semibold text-purple-700 dark:text-purple-400">
                          {row.verified.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-gray-600 dark:text-slate-400 text-xs">
                        {row.step1Only.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-red-600 dark:text-red-500 text-xs font-semibold">
                        {row.failed.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
