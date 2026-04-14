import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FileText, Languages, BookOpen, Database } from "lucide-react";

type DatasetStats = {
  totalDocs: number;
  englishDocs: number;
  vietnameseDocs: number;
  totalBytes: number;
};

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function DatasetFilesStats({ stats }: { stats: DatasetStats | null }) {
  const totalDocs = stats?.totalDocs ?? 0;
  const englishDocs = stats?.englishDocs ?? 0;
  const vietnameseDocs = stats?.vietnameseDocs ?? 0;
  const totalBytes = stats?.totalBytes ?? 0;

  const cards = [
    {
      label: "Total PDF Documents",
      value: formatNumber(totalDocs),
      icon: FileText,
      description: "All PDFs in dataset folders",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "English Documents",
      value: formatNumber(englishDocs),
      icon: BookOpen,
      description: "PDFs under English dataset",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Vietnamese Documents",
      value: formatNumber(vietnameseDocs),
      icon: Languages,
      description: "PDFs under Vietnamese dataset",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Total Size",
      value: formatBytes(totalBytes),
      icon: Database,
      description: "Total bytes of PDFs",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}