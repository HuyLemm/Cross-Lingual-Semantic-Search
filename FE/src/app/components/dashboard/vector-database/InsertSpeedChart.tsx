import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

type InsertSpeedPoint = {
  database: string;
  insertSpeed: number | null | undefined;
};

interface InsertSpeedChartProps {
  data: InsertSpeedPoint[];
}

export default function InsertSpeedChart({ data }: InsertSpeedChartProps) {
  const clean = (data || [])
    .map((d) => ({
      database: String(d.database ?? ''),
      insertSpeed: d.insertSpeed == null ? null : Number(d.insertSpeed)
    }))
    .filter((d) => d.database && typeof d.insertSpeed === "number");

  const max = clean.length
    ? Math.max(...clean.map((d) => d.insertSpeed as number))
    : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insert Speed (vectors/sec)</CardTitle>
      </CardHeader>

      <CardContent className="min-h-[340px]">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={clean}
            margin={{
              top: 20,
              right: 20,
              left: 30,   // 👈 thêm khoảng trống cho Y axis
              bottom: 10
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="database"
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}   // 👈 thêm space cho label nghiêng
            />

            <YAxis
              domain={[0, max * 1.1]}
              width={80}  // 👈 tránh cắt số lớn
              tickFormatter={(v) =>
                typeof v === "number" ? v.toLocaleString() : ""
              }
              label={{
                value: "Vectors/sec",
                angle: -90,
                position: "outsideLeft", // 👈 quan trọng
                offset: 20
              }}
            />

            <Tooltip
              formatter={(value) => {
                const v = typeof value === "number" ? value : Number(value);
                return Number.isFinite(v)
                  ? [`${v.toLocaleString()} vec/s`, "Insert Speed"]
                  : ["—", "Insert Speed"];
              }}
            />

            <Bar
              dataKey="insertSpeed"
              fill="#3b82f6"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}