import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

import TabSummary from "./option2-evaluation/TabSummary";
import TabModelComparison from "./option2-evaluation/TabModelComparison";
import TabLanguage from "./option2-evaluation/TabLanguage";
import TabLatency from "./option2-evaluation/TabLatency";
import TabTables from "./option2-evaluation/TabTables";

// Baseline configuration (Option 2)
const config = {
  name: "Advanced Configuration",
  language: "EN & VI",
  chunkEmbedding: "BGE (BAAI/bge-m3)",
  queryEmbedding: "BGE (BAAI/bge-m3)",
  vectorIndex: "FAISS IndexFlatIP (72 threads)",
  stage1Retrieval: "FAISS CPU (72 threads)",
  stage2Reranker: "BAAI/bge-reranker-v2-m3",
  rankingMethod: "Cross-Encoder Score",
};

export default function Option2Evaluation() {
  const [activePage, setActivePage] = useState("summary");

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto bg-white dark:bg-slate-900">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Multilingual Retrieval Evaluation – Comparative Analysis
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Comparative Evaluation Across 18 Retrieval Configurations
          </p>
        </div>

        {/* Configuration Display */}
        <Card className="border-gray-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Active Configuration: {config.name}
              </CardTitle>
              <Badge className="bg-blue-600 text-white">
                Baseline (Option 1)
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Language:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.language}
                </p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Chunk Embedding:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.chunkEmbedding}
                </p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Query Embedding:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.queryEmbedding}
                </p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Vector Index:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.vectorIndex}
                </p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Stage 1 Retrieval:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.stage1Retrieval}
                </p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Stage 2 Reranker:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.stage2Reranker}
                </p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-slate-400">
                  Ranking method:
                </span>
                <p className="font-mono text-gray-900 dark:text-slate-100 mt-1">
                  {config.rankingMethod}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activePage}
          onValueChange={setActivePage}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-5 w-full bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger value="summary" className="text-sm">
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="model" className="text-sm">
              Model Comparison
            </TabsTrigger>
            <TabsTrigger value="language" className="text-sm">
              Language
            </TabsTrigger>
            <TabsTrigger value="latency" className="text-sm">
              Latency
            </TabsTrigger>
            <TabsTrigger value="tables" className="text-sm">
              Detailed Tables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <TabSummary />
          </TabsContent>

          <TabsContent value="model" className="space-y-6">
            <TabModelComparison />
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <TabLanguage />
          </TabsContent>

          <TabsContent value="latency" className="space-y-6">
            <TabLatency />
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <TabTables />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
