import { useState } from 'react';
import SearchQAHeader from './search-qa-testing/SearchQAHeader';
import SearchConfigPanel from './search-qa-testing/SearchConfigPanel';
import GroundTruthPanel from './search-qa-testing/GroundTruthPanel';
import SearchResultsPanel from './search-qa-testing/SearchResultsPanel';
import QueryPerformanceMetrics from './search-qa-testing/QueryPerformanceMetrics';
import { mockSearchResults, groundTruth } from './search-qa-testing/searchQATestingData';

export default function SearchQATesting() {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState([10]);
  const [language, setLanguage] = useState('en');
  const [model, setModel] = useState('bge-m3');

  return (
    <div className="space-y-6">
      <SearchQAHeader />
      <SearchConfigPanel
        query={query}
        topK={topK}
        language={language}
        model={model}
        onQueryChange={setQuery}
        onTopKChange={setTopK}
        onLanguageChange={setLanguage}
        onModelChange={setModel}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroundTruthPanel groundTruth={groundTruth} />
        <SearchResultsPanel results={mockSearchResults} groundTruthChunkId={groundTruth.sourceChunk} />
      </div>
      <QueryPerformanceMetrics />
    </div>
  );
}