import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Props {
  modelKey: 'LLM' | 'BGE';
  onModelChange: (v: 'LLM' | 'BGE') => void;
}

export default function IndexingChunkingHeader({ modelKey, onModelChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Indexing & Chunking</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Compare indexing structures and chunking strategies
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Model</label>
              <Select
                value={modelKey}
                onValueChange={(v) => onModelChange(v === 'BGE' ? 'BGE' : 'LLM')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLM">LLM</SelectItem>
                  <SelectItem value="BGE">BGE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}