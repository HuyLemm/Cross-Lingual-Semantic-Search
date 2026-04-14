import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function toNum(v: any, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

type DistBin = {
  range?: string;
  from?: number;
  to?: number;
  count?: number;
};

function formatRange(bin: DistBin) {
  if (bin.range) return bin.range;
  const a = toNum(bin.from, 0);
  const b = toNum(bin.to, 0);
  return `${a.toFixed(1)}-${b.toFixed(1)}`;
}

export function QueryTestLanguageAnalysis(props: {
  languageData: any[];
  mrrDistribution?: DistBin[];
}) {
  const { languageData, mrrDistribution } = props;

  const distData = useMemo(() => {
    const arr = Array.isArray(mrrDistribution) ? mrrDistribution : [];
    return arr.map((b) => ({
      bin: formatRange(b),
      count: toNum(b.count, 0),
      _from: b.from,
      _to: b.to,
    }));
  }, [mrrDistribution]);

  const distTotal = useMemo(
    () => distData.reduce((s, x) => s + toNum(x.count, 0), 0),
    [distData]
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* LEFT: Performance by Language */}
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Performance by Language
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={languageData}
              margin={{ top: 10, right: 10, left: 0, bottom: 18 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="language" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />

              <Tooltip
                formatter={(v: any, name: any) => {
                  const n = toNum(v, 0);
                  if (name === "Recall@10") return [`${(n * 100).toFixed(1)}%`, "Recall@10"];
                  if (name === "MRR") return [`${n.toFixed(3)}`, "MRR"];
                  return [String(v), String(name)];
                }}
              />

              <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />

              <Bar
                dataKey="recall10"
                name="Recall@10"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="mrr"
                name="MRR"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <p className="mt-2 text-[13px] text-gray-500 dark:text-slate-400">
            Compare overall retrieval (Recall@10) and ranking quality (MRR) by query language.
          </p>
        </CardContent>
      </Card>

      {/* RIGHT: MRR Distribution */}
      <Card className="border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            MRR Distribution
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distData} margin={{ top: 10, right: 10, left: 0, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />

              <Tooltip
                formatter={(v: any, name: any) => [`${toNum(v, 0)}`, String(name)]}
                labelFormatter={(label: any) => `MRR bin: ${label}`}
              />

              <Legend wrapperStyle={{ fontSize: "13px" }} iconSize={10} />

              <Bar
                dataKey="count"
                name="Count"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <p className="mt-2 text-[13px] text-gray-500 dark:text-slate-400">
            Total queries: <span className="font-mono">{distTotal}</span>. If most mass is in low bins,
            ranking quality is weak even if Recall@10 looks OK.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}