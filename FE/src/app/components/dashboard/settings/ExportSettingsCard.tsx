import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';

export default function ExportSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="export-format">Default Export Format</Label>
          <Select defaultValue="csv">
            <SelectTrigger id="export-format" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              <SelectItem value="pdf">PDF Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Include Configuration in Export</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Embed experiment configuration in exported files
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Include Error Details</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Export detailed error analysis with results
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
