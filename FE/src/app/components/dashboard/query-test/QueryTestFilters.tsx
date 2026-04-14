import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Label } from "../../ui/label";

export function QueryTestFilters(props: {
  queryTypeFilter: string;
  setQueryTypeFilter: (v: string) => void;
  languageFilter: string;
  setLanguageFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;

  // NEW: types list from API/rows
  availableTypes: string[];
}) {
  const {
    queryTypeFilter,
    setQueryTypeFilter,
    languageFilter,
    setLanguageFilter,
    statusFilter,
    setStatusFilter,
    availableTypes,
  } = props;

  return (
    <Card className="border-gray-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Query Type:
            </Label>

            <Select value={queryTypeFilter} onValueChange={setQueryTypeFilter}>
              <SelectTrigger className="w-[200px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Language:
            </Label>

            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="VI">Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Status:
            </Label>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}