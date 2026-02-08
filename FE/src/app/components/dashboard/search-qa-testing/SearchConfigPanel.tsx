import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Slider } from '@/app/components/ui/slider';
import { Search } from 'lucide-react';

interface SearchConfigPanelProps {
  query: string;
  topK: number[];
  language: string;
  model: string;
  onQueryChange: (query: string) => void;
  onTopKChange: (topK: number[]) => void;
  onLanguageChange: (language: string) => void;
  onModelChange: (model: string) => void;
}

export default function SearchConfigPanel({
  query,
  topK,
  language,
  model,
  onQueryChange,
  onTopKChange,
  onLanguageChange,
  onModelChange,
}: SearchConfigPanelProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Search Configuration</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Query</label>
          <div className="flex space-x-2">
            <Input placeholder="Enter your search query..." value={query} onChange={(e) => onQueryChange(e.target.value)} className="flex-1" />
            <Button><Search className="w-4 h-4 mr-2" />Search</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Query Language</label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Vietnamese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Embedding Model</label>
            <Select value={model} onValueChange={onModelChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bge-m3">BGE-M3</SelectItem>
                <SelectItem value="me5-large">mE5-large</SelectItem>
                <SelectItem value="labse">LaBSE</SelectItem>
                <SelectItem value="muse">mUSE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Reranker</label>
            <Select defaultValue="none">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="cross-encoder">Cross-Encoder</SelectItem>
                <SelectItem value="colbert">ColBERT</SelectItem>
                <SelectItem value="bge-reranker">BGE Reranker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Vector Database</label>
            <Select defaultValue="faiss">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="faiss">FAISS</SelectItem>
                <SelectItem value="milvus">Milvus</SelectItem>
                <SelectItem value="qdrant">Qdrant</SelectItem>
                <SelectItem value="weaviate">Weaviate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Top-K: {topK[0]}</label>
          <Slider value={topK} onValueChange={onTopKChange} min={1} max={50} step={1} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
