import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';

export default function AdvancedSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="batch-size">Batch Size</Label>
            <Input 
              id="batch-size" 
              type="number" 
              defaultValue="32" 
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="num-threads">Number of Threads</Label>
            <Input 
              id="num-threads" 
              type="number" 
              defaultValue="8" 
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="cache-size">Cache Size (MB)</Label>
            <Input 
              id="cache-size" 
              type="number" 
              defaultValue="2048" 
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="seed">Random Seed</Label>
            <Input 
              id="seed" 
              type="number" 
              defaultValue="42" 
              className="mt-2"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label>Enable GPU Acceleration</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use GPU for embedding generation (if available)
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Caching</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cache embeddings and results for faster reruns
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Verbose Logging</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enable detailed logging for debugging
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
