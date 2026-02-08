import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Slider } from '@/app/components/ui/slider';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { Play, RotateCcw } from 'lucide-react';

// Function to highlight matching keywords in text
function highlightMatches(text: string, query: string): React.ReactNode {
  // Extract meaningful keywords from query (remove stop words and short words)
  const stopWords = new Set(['how', 'does', 'the', 'is', 'in', 'a', 'an', 'and', 'or', 'but', 'what', 'when', 'where', 'why', 'who', 'which', 'that', 'this', 'these', 'those']);
  
  // Clean and tokenize query
  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Extract n-grams (phrases of different lengths)
  const phrases: { text: string; length: number }[] = [];
  
  // 4-grams (longer phrases first for priority matching)
  for (let i = 0; i <= queryTokens.length - 4; i++) {
    const phrase = queryTokens.slice(i, i + 4);
    if (phrase.some(w => !stopWords.has(w) && w.length > 3)) {
      phrases.push({ text: phrase.join(' '), length: 4 });
    }
  }
  
  // 3-grams
  for (let i = 0; i <= queryTokens.length - 3; i++) {
    const phrase = queryTokens.slice(i, i + 3);
    if (phrase.some(w => !stopWords.has(w) && w.length > 3)) {
      phrases.push({ text: phrase.join(' '), length: 3 });
    }
  }
  
  // 2-grams
  for (let i = 0; i <= queryTokens.length - 2; i++) {
    const phrase = queryTokens.slice(i, i + 2);
    if (phrase.some(w => !stopWords.has(w) && w.length > 3)) {
      phrases.push({ text: phrase.join(' '), length: 2 });
    }
  }
  
  // Individual keywords (1-gram)
  const keywords = queryTokens
    .filter(word => word.length > 3 && !stopWords.has(word))
    .map(word => ({ text: word, length: 1 }));

  phrases.push(...keywords);

  if (phrases.length === 0) {
    return text;
  }

  // Track highlighted regions to avoid overlapping
  const highlights: { start: number; end: number; text: string; type: 'phrase' | 'keyword' }[] = [];
  const lowerText = text.toLowerCase();

  // First pass: find phrase matches (longer phrases first)
  phrases
    .sort((a, b) => b.length - a.length)
    .forEach(phrase => {
      const searchText = phrase.text;
      let startPos = 0;
      
      while (true) {
        const index = lowerText.indexOf(searchText, startPos);
        if (index === -1) break;
        
        const end = index + searchText.length;
        
        // Check if this region overlaps with existing highlights
        const overlaps = highlights.some(h => 
          (index >= h.start && index < h.end) || 
          (end > h.start && end <= h.end) ||
          (index <= h.start && end >= h.end)
        );
        
        if (!overlaps) {
          // Check word boundaries
          const beforeOk = index === 0 || /\s/.test(text[index - 1]);
          const afterOk = end === text.length || /\s/.test(text[end]);
          
          if (beforeOk && afterOk) {
            highlights.push({
              start: index,
              end,
              text: text.substring(index, end),
              type: phrase.length > 1 ? 'phrase' : 'keyword'
            });
          }
        }
        
        startPos = index + 1;
      }
    });

  // Sort highlights by position
  highlights.sort((a, b) => a.start - b.start);

  // Build result with highlighted portions
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  highlights.forEach((highlight, idx) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      parts.push(text.substring(lastIndex, highlight.start));
    }
    
    // Add highlighted text with different styles for phrases vs keywords
    if (highlight.type === 'phrase') {
      parts.push(
        <mark 
          key={`phrase-${idx}`}
          className="bg-amber-100 dark:bg-amber-900/40 text-gray-900 dark:text-amber-100 px-1 rounded font-semibold border-b-2 border-amber-400 dark:border-amber-600"
        >
          {highlight.text}
        </mark>
      );
    } else {
      parts.push(
        <mark 
          key={`keyword-${idx}`}
          className="bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-1 rounded font-medium"
        >
          {highlight.text}
        </mark>
      );
    }
    
    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

export default function ModelTestingWorkbench() {
  const [topK, setTopK] = useState([10]);
  const [query, setQuery] = useState('How does attention mechanism work in transformers?');
  const [model, setModel] = useState('bge-m3');
  const [running, setRunning] = useState(false);

  // Mock search results
  const results = [
    {
      rank: 1,
      chunkId: 'chunk_001',
      score: 0.942,
      text: 'The attention mechanism allows the model to dynamically focus on different parts of the input sequence. In transformers, self-attention computes attention weights for all positions simultaneously, enabling parallel processing and capturing long-range dependencies.',
      source: 'attention_is_all_you_need.pdf',
      page: 3,
      language: 'EN',
      isGroundTruth: true,
    },
    {
      rank: 2,
      chunkId: 'chunk_142',
      score: 0.887,
      text: 'Multi-head attention extends the attention mechanism by computing multiple attention functions in parallel. Each head learns different aspects of the relationships between tokens, which are then concatenated and projected.',
      source: 'attention_is_all_you_need.pdf',
      page: 4,
      language: 'EN',
      isGroundTruth: false,
    },
    {
      rank: 3,
      chunkId: 'chunk_089',
      score: 0.854,
      text: 'The scaled dot-product attention computes attention scores by taking the dot product of queries and keys, scaling by the square root of the dimension, and applying softmax to obtain weights.',
      source: 'transformer_architecture.pdf',
      page: 2,
      language: 'EN',
      isGroundTruth: false,
    },
    {
      rank: 4,
      chunkId: 'chunk_231',
      score: 0.821,
      text: 'Attention mechanisms have become fundamental in natural language processing, enabling models to weigh the importance of different input elements when producing outputs.',
      source: 'nlp_fundamentals.pdf',
      page: 12,
      language: 'EN',
      isGroundTruth: false,
    },
    {
      rank: 5,
      chunkId: 'chunk_312',
      score: 0.796,
      text: 'Cross-attention allows the decoder to attend to encoder outputs, creating connections between source and target sequences in sequence-to-sequence tasks.',
      source: 'seq2seq_models.pdf',
      page: 8,
      language: 'EN',
      isGroundTruth: false,
    },
  ];

  const groundTruth = {
    question: 'How does attention mechanism work in transformers?',
    expectedChunkId: 'chunk_001',
    expectedAnswer: 'The attention mechanism allows the model to dynamically focus on different parts of the input sequence...',
  };

  const handleRun = () => {
    setRunning(true);
    // Simulate experiment run
    setTimeout(() => setRunning(false), 1500);
  };

  return (
    <div className="flex h-[calc(100vh-57px)] bg-white dark:bg-slate-900">
      {/* Left Panel: Configuration */}
      <div className="w-80 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1 uppercase tracking-wide">
              Experiment Configuration
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Configure, execute, and evaluate a single semantic search experiment against ground truth.
            </p>
          </div>

          {/* Query Input */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">Query</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              placeholder="Enter search query"
            />
          </div>

          <Separator className="dark:bg-slate-700" />

          {/* Model Selection */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Embedding Model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bge-m3">BGE-M3</SelectItem>
                <SelectItem value="me5-large">mE5-large</SelectItem>
                <SelectItem value="labse">LaBSE</SelectItem>
                <SelectItem value="muse">mUSE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Query Language
            </Label>
            <Select defaultValue="en">
              <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Vietnamese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="dark:bg-slate-700" />

          {/* Indexing Strategy */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Index Strategy
            </Label>
            <Select defaultValue="hnsw">
              <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat (Exhaustive)</SelectItem>
                <SelectItem value="ivf">IVF</SelectItem>
                <SelectItem value="hnsw">HNSW</SelectItem>
                <SelectItem value="pq">Product Quantization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reranker */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Reranker
            </Label>
            <Select defaultValue="none">
              <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="cross-encoder">Cross-Encoder</SelectItem>
                <SelectItem value="colbert">ColBERT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="dark:bg-slate-700" />

          {/* Top-K Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Top-K Results
              </Label>
              <span className="text-sm font-mono text-gray-900 dark:text-slate-200">{topK[0]}</span>
            </div>
            <Slider
              value={topK}
              onValueChange={setTopK}
              min={1}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Run Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={handleRun}
              disabled={running}
              className="w-full bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white"
            >
              {running ? (
                <>Running...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Experiment
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Center Panel: Results */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        <div className="p-6">
          {/* Ground Truth */}
          <Card className="mb-6 border-gray-200 dark:border-slate-700 dark:bg-slate-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wide">
                Ground Truth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 uppercase">Question:</span>
                  <p className="text-sm text-gray-900 dark:text-slate-100 mt-1">{groundTruth.question}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 uppercase">Expected Chunk:</span>
                  <p className="text-xs font-mono text-gray-700 dark:text-slate-300 mt-1">{groundTruth.expectedChunkId}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 uppercase">Expected Answer:</span>
                  <p className="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 p-3 rounded mt-1">
                    {groundTruth.expectedAnswer}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retrieved Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wide">
                Retrieved Results ({results.length})
              </h3>
              
              {/* Highlighting Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="bg-amber-100 dark:bg-amber-900/40 border-b-2 border-amber-400 dark:border-amber-600 px-2 py-0.5 rounded font-semibold">
                    phrase
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">Phrase Match</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-medium">
                    word
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">Keyword</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {results.map((result) => (
                <Card
                  key={result.rank}
                  className={`${
                    result.isGroundTruth
                      ? 'border-2 border-slate-600 dark:border-slate-500 bg-slate-50 dark:bg-slate-800'
                      : 'border border-gray-200 dark:border-slate-700 dark:bg-slate-850'
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Result Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs border-gray-300 dark:border-slate-600 dark:text-slate-300">
                          Rank {result.rank}
                        </Badge>
                        <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-200">
                          {result.score.toFixed(3)}
                        </Badge>
                        {result.isGroundTruth && (
                          <Badge className="bg-slate-700 dark:bg-slate-600 text-white text-xs">
                            ✓ Ground Truth Match
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-slate-600 dark:text-slate-300">{result.language}</Badge>
                    </div>

                    {/* Result Text */}
                    <p className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed mb-3">
                      {highlightMatches(result.text, query)}
                    </p>

                    {/* Result Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
                      <span className="font-mono">{result.chunkId}</span>
                      <span>•</span>
                      <span>{result.source}</span>
                      <span>•</span>
                      <span>Page {result.page}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Metrics */}
      <div className="w-80 border-l border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 uppercase tracking-wide">
              Run Metrics
            </h3>
          </div>

          {/* Retrieval Metrics */}
          <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Retrieval Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Recall@1</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">1.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Recall@5</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">1.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Recall@10</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">1.000</span>
              </div>
              <Separator className="dark:bg-slate-700" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">MRR</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">1.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Precision@5</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">0.200</span>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Analysis */}
          <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Ranking Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Ground Truth Rank</span>
                <Badge className="bg-slate-700 dark:bg-slate-600 text-white">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Top Score</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">0.942</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Score Gap (1-2)</span>
                <span className="text-sm font-mono text-gray-700 dark:text-slate-300">0.055</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Avg Score</span>
                <span className="text-sm font-mono text-gray-700 dark:text-slate-300">0.860</span>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Total Latency</span>
                <span className="text-sm font-mono text-gray-900 dark:text-slate-100">45 ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Embedding Time</span>
                <span className="text-sm font-mono text-gray-700 dark:text-slate-300">32 ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Retrieval Time</span>
                <span className="text-sm font-mono text-gray-700 dark:text-slate-300">8 ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-slate-400">Reranking Time</span>
                <span className="text-sm font-mono text-gray-700 dark:text-slate-300">- ms</span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="border-gray-200 dark:border-slate-700 dark:bg-slate-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Model</span>
                <span className="font-mono text-gray-900 dark:text-slate-100">BGE-M3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Index</span>
                <span className="font-mono text-gray-900 dark:text-slate-100">HNSW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Reranker</span>
                <span className="font-mono text-gray-900 dark:text-slate-100">None</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Top-K</span>
                <span className="font-mono text-gray-900 dark:text-slate-100">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Language</span>
                <span className="font-mono text-gray-900 dark:text-slate-100">EN</span>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="pt-2">
            <div className="text-xs text-gray-500 dark:text-slate-400 text-center">
              Last updated: 14:32:15 UTC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}