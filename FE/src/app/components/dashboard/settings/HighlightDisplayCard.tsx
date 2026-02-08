import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Slider } from '@/app/components/ui/slider';

interface HighlightDisplayCardProps {
  highlightSensitivity: number[];
  onHighlightChange: (value: number[]) => void;
}

export default function HighlightDisplayCard({
  highlightSensitivity,
  onHighlightChange,
}: HighlightDisplayCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Highlight & Display Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Highlight Sensitivity: {highlightSensitivity[0]}%</Label>
          </div>
          <Slider
            value={highlightSensitivity}
            onValueChange={onHighlightChange}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Threshold for highlighting matching text in results
          </p>
        </div>

        <div>
          <Label htmlFor="context-window">Context Window Size</Label>
          <Select defaultValue="medium">
            <SelectTrigger id="context-window" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (±50 chars)</SelectItem>
              <SelectItem value="medium">Medium (±100 chars)</SelectItem>
              <SelectItem value="large">Large (±200 chars)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Show Similarity Scores</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Display numerical similarity scores in results
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Show Source Metadata</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Display document metadata (language, source, etc.)
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}
