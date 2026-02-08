import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export default function IndexingChunkingHeader() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Indexing & Chunking</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Compare indexing structures and chunking strategies</p>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Indexing Strategy</label>
              <Select defaultValue="hnsw">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat (Exhaustive)</SelectItem>
                  <SelectItem value="ivf">IVF (Inverted File)</SelectItem>
                  <SelectItem value="hnsw">HNSW</SelectItem>
                  <SelectItem value="pq">Product Quantization</SelectItem>
                  <SelectItem value="ivfpq">IVF + PQ Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Chunking Strategy</label>
              <Select defaultValue="semantic">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed512">Fixed Size (512 tokens)</SelectItem>
                  <SelectItem value="fixed1024">Fixed Size (1024 tokens)</SelectItem>
                  <SelectItem value="sliding">Sliding Window (512/128)</SelectItem>
                  <SelectItem value="semantic">Semantic Chunking</SelectItem>
                  <SelectItem value="paragraph">Paragraph-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
