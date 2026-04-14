import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { QueryRow } from "./QueryTest.constants";

function toNum(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function shortLabel(s: string, max = 16) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

type Agg = {
  count: number;
  sumRecall10: number;
  sumSuccess: number;
  sumSim: number;
};

function emptyAgg(): Agg {
  return { count: 0, sumRecall10: 0, sumSuccess: 0, sumSim: 0 };
}

function finalize(a: Agg) {
  return {
    count: a.count,
    recall10: a.count ? a.sumRecall10 / a.count : 0,
    successRate: a.count ? a.sumSuccess / a.count : 0,
    avgSimilarity: a.count ? a.sumSim / a.count : 0,
  };
}

export function QueryTestQueryTypes(props: { rows: QueryRow[] }) {
  const { rows } = props;

  const { chartData, tableData, engines } = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : [];

    // detect engines from data (expect LLM, BGE)
    const engineSet = new Set(
      arr.map((r: any) => String(r.engine || "UNKNOWN").toUpperCase())
    );
    const engines = Array.from(engineSet).sort((a, b) => a.localeCompare(b));

    // group: type -> engine -> agg
    const byType: Record<string, Record<string, Agg>> = {};

    for (const r of arr as any[]) {
      const type = String(r.type || "Unknown");
      const engine = String(r.engine || "UNKNOWN").toUpperCase();

      if (!byType[type]) byType[type] = {};
      if (!byType[type][engine]) byType[type][engine] = emptyAgg();

      const a = byType[type][engine];
      a.count += 1;
      a.sumRecall10 += toNum(r.recall10, 0);
      a.sumSuccess += r.status === "success" ? 1 : 0;
      a.sumSim += toNum(r.similarity, 0);
    }

    const types = Object.keys(byType).sort((a, b) => a.localeCompare(b));

    const chartData = types.map((type) => {
      const out: any = { type };

      for (const e of engines) {
        const agg = byType[type][e] || emptyAgg();
        const f = finalize(agg);
        out[`${e}_recall10`] = f.recall10;
        out[`${e}_count`] = f.count;
        out[`${e}_successRate`] = f.successRate;
        out[`${e}_avgSimilarity`] = f.avgSimilarity;
      }

      out._totalCount = engines.reduce(
        (s, e) => s + (toNum(out[`${e}_count`], 0) || 0),
        0
      );

      return out;
    });

    // sort by total count desc
    chartData.sort((a, b) => (b._totalCount || 0) - (a._totalCount || 0));

    return { chartData, tableData: chartData, engines };
  }, [rows]);

  // Compare engines (chart): lấy 2 engine đầu tiên nếu có
  const primaryEngines = engines.length ? engines : ["LLM", "BGE"];
  const e1 = primaryEngines[0] || "LLM";
  const e2 = primaryEngines[1] || "BGE";

  // Table (right): chọn 1 engine để hiển thị
  const [selectedEngine, setSelectedEngine] = useState<string>(e1);

  // nếu engines thay đổi, giữ selectedEngine hợp lệ
  useEffect(() => {
    if (!primaryEngines.length) return;
    if (!primaryEngines.includes(selectedEngine)) {
      setSelectedEngine(primaryEngines[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engines.join("|")]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Chart */}
        <Card className="border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Recall@10 by Query Type (Compare Engines)
            </CardTitle>
          </CardHeader>

          {/* cho khung cao hơn + chart fill full */}
          <CardContent className="h-[520px] flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 70 }}
                  barCategoryGap={18}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-24}
                    textAnchor="end"
                    height={95}
                    tickFormatter={(v) => shortLabel(String(v), 22)}
                  />

                  <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />

                  <Tooltip
                    formatter={(value: any, name: any) => {
                      const v = toNum(value, 0);
                      const key = String(name);
                      const [engine, metric] = key.split("_");
                      if (metric === "recall10")
                        return [`${(v * 100).toFixed(0)}%`, `${engine} Recall@10`];
                      return [String(value), key];
                    }}
                    labelFormatter={(label: any) => `Type: ${label}`}
                  />

                  <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />

                  <Bar
                    dataKey={`${e1}_recall10`}
                    name={`${e1} Recall@10`}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={46}
                  />
                  <Bar
                    dataKey={`${e2}_recall10`}
                    name={`${e2} Recall@10`}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={46}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-[13px] text-gray-500 dark:text-slate-400">
              Computed on frontend from rows (no backend aggregation). Sorted by total count.
            </p>
          </CardContent>
        </Card>

      {/* Right: Table with engine selector */}
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-gray-700 dark:text-slate-300">
            Query Type Summary
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-slate-400">
              Engine:
            </span>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none
                         focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {primaryEngines.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">Query Type</th>

                  <th className="text-center py-2 px-2 font-semibold">
                    {selectedEngine} Count
                  </th>
                  <th className="text-center py-2 px-2 font-semibold">
                    {selectedEngine} Recall@10
                  </th>
                  <th className="text-center py-2 px-2 font-semibold">
                    {selectedEngine} Success
                  </th>
                  <th className="text-center py-2 px-2 font-semibold">
                    {selectedEngine} Avg Sim
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-850">
                {tableData.map((item: any, idx: number) => {
                  const c = toNum(item[`${selectedEngine}_count`], 0);
                  const r10 = toNum(item[`${selectedEngine}_recall10`], 0);
                  const succ = toNum(item[`${selectedEngine}_successRate`], 0);
                  const sim = toNum(item[`${selectedEngine}_avgSimilarity`], 0);

                  return (
                    <tr
                      key={`${item.type}-${idx}`}
                      className="border-t border-gray-100 dark:border-slate-800"
                    >
                      <td className="py-2 px-3 font-semibold">{item.type}</td>

                      <td className="py-2 px-2 text-center font-mono">{c}</td>
                      <td className="py-2 px-2 text-center font-mono">
                        {(r10 * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {(succ * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {sim.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}

                {!tableData.length && (
                  <tr className="border-t border-gray-100 dark:border-slate-800">
                    <td colSpan={5} className="py-4 px-3 text-center text-gray-500">
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}