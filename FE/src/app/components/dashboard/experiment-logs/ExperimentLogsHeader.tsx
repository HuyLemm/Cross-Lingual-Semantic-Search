import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search, Download } from "lucide-react";

export default function ExperimentLogsHeader() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">
        Experiment Logs
      </h2>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
        Track and compare experimental configurations, metrics, and outcomes.
      </p>

      <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by Run ID, model, or dataset..."
                className="border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <Button
              variant="outline"
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
