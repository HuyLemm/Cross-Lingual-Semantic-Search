import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Moon, Sun, Download } from "lucide-react";
import ModelTestingWorkbench from "@/app/components/workbench/ModelTestingWorkbench";
import OverviewSummary from "@/app/components/workbench/OverviewSummary";
import DatasetGroundTruth from "@/app/components/dashboard/DatasetGroundTruth";
import LanguageEvaluation from "@/app/components/dashboard/LanguageEvaluation";
import ModelComparison from "@/app/components/dashboard/ModelComparison";
import EmbeddingAnalysis from "@/app/components/dashboard/EmbeddingAnalysis";
import RerankingAnalysis from "@/app/components/dashboard/RerankingAnalysis";
import IndexingChunking from "@/app/components/dashboard/IndexingChunking";
import VectorDatabaseEvaluation from "@/app/components/dashboard/VectorDatabaseEvaluation";
import ErrorAnalysis from "@/app/components/dashboard/ErrorAnalysis";
import ExperimentLogs from "@/app/components/dashboard/ExperimentLogs";
import Settings from "@/app/components/dashboard/Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState("workbench");
  const [darkMode, setDarkMode] = useState(false);
  const [dataset, setDataset] = useState("arxiv-multilingual");
  const [experiment, setExperiment] = useState("exp-001");

  const tabs = [
    { id: "workbench", label: "Experiment Playground", group: "control" },
    { id: "overview", label: "Evaluation Overview", group: "control" },
    { id: "dataset", label: "Dataset Management", group: "data" },
    { id: "language", label: "Language Evaluation", group: "data" },
    { id: "model", label: "Model Comparison", group: "model" },
    { id: "embedding", label: "Embedding Analysis", group: "model" },
    { id: "reranking", label: "Reranking Analysis", group: "model" },
    { id: "indexing", label: "Indexing & Chunking", group: "system" },
    { id: "vectordb", label: "Vector Database", group: "system" },
    { id: "error", label: "Error Analysis", group: "evaluation" },
    { id: "logs", label: "Experiment Logs", group: "evaluation" },
    { id: "settings", label: "Settings", group: "evaluation" },
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // Mock export functionality
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "workbench":
        return <ModelTestingWorkbench />;
      case "overview":
        return <OverviewSummary />;
      case "dataset":
        return <DatasetGroundTruth />;
      case "language":
        return <LanguageEvaluation />;
      case "model":
        return <ModelComparison />;
      case "embedding":
        return <EmbeddingAnalysis />;
      case "reranking":
        return <RerankingAnalysis />;
      case "indexing":
        return <IndexingChunking />;
      case "vectordb":
        return <VectorDatabaseEvaluation />;
      case "error":
        return <ErrorAnalysis />;
      case "logs":
        return <ExperimentLogs />;
      case "settings":
        return <Settings />;
      default:
        return <ModelTestingWorkbench />;
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        {/* Top Navigation Bar */}
        <header className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-base font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
                  Multilingual Semantic Search Evaluation
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  className="h-8 border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Export
                </Button>

                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="h-8 w-8 p-0 dark:hover:bg-slate-700"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex">
          {/* Left Sidebar Navigation - Always visible */}
          <aside className="w-56 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 min-h-[calc(100vh-57px)]">
            <nav className="p-3 space-y-1">
              {tabs.map((tab, index) => {
                const prevGroup = index > 0 ? tabs[index - 1].group : null;
                const showDivider = tab.group !== prevGroup && index > 0;

                return (
                  <div key={tab.id}>
                    {showDivider && (
                      <div className="my-3 border-t border-gray-200 dark:border-slate-700" />
                    )}
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded text-left transition-colors text-sm ${
                        activeTab === tab.id
                          ? "bg-slate-700 dark:bg-slate-600 text-white font-medium"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white dark:bg-slate-900">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
