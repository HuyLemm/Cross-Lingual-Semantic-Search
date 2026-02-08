import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { ModelItem } from './settingsData';

interface ModelManagementCardProps {
  models: ModelItem[];
}

export default function ModelManagementCard({ models }: ModelManagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Model Management</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {models.map((model) => (
            <div key={model.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Switch checked={model.enabled} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{model.path}</p>
                </div>
                {model.enabled && <Badge variant="default">Active</Badge>}
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
