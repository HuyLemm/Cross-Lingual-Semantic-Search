import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { DatasetItem } from './settingsData';

interface DatasetManagementCardProps {
  datasets: DatasetItem[];
}

export default function DatasetManagementCard({ datasets }: DatasetManagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dataset Management</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Dataset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Switch checked={dataset.enabled} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{dataset.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{dataset.path}</p>
                </div>
                {dataset.enabled && <Badge variant="default">Active</Badge>}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
