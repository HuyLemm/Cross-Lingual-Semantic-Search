import { Button } from '@/app/components/ui/button';
import { Save } from 'lucide-react';

export default function SettingsActions() {
  return (
    <div className="flex justify-end space-x-3">
      <Button variant="outline">
        Reset to Defaults
      </Button>
      <Button>
        <Save className="w-4 h-4 mr-2" />
        Save Settings
      </Button>
    </div>
  );
}
