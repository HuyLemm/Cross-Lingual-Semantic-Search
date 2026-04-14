import { useState } from "react";
import { Button } from "../app/components/ui/button";
import { Moon, Sun, Download } from "lucide-react";
import QAValidation from "../app/components/dashboard/QAValidation";
import QAEvaluation from "../app/components/dashboard/QAEvaluation";
import Option1Eval from "../app/components/dashboard/Option1Evaluation";
import Option2Eval from "../app/components/dashboard/Option2Evaluation";
import ModelComparison from "../app/components/dashboard/ModelComparison";
import IndexingChunking from "../app/components/dashboard/IndexingChunking";
import VectorDatabaseEvaluation from "../app/components/dashboard/VectorDatabaseEvaluation";
import SearchQATesting from "../app/components/dashboard/SearchQATesting";
import DatasetManagement from "../app/components/dashboard/DatasetManagement";
import QueryTestResults from "./components/dashboard/QueryTestResults";

export default function App() {
  const [activeTab, setActiveTab] = useState("workbench");
  const [darkMode, setDarkMode] = useState(false);

  const tabs = [
    { id: "workbench", label: "Experiment Playground", group: "control" },
    { id: "overview", label: "Query Test Results", group: "control" },
    { id: "dataset-management", label: "Dataset Management", group: "data" },
    { id: "qa-validation", label: "QA Validation", group: "data" },
    { id: "qa-evaluation", label: "QA Evaluation", group: "data" },
    { id: "option1Eval", label: "MiniLM Search Results", group: "model" },
    { id: "option2Eval", label: "BGE Search Results", group: "model" },
    { id: "comparison", label: "Comparative Analysis", group: "model" },
    { id: "indexing", label: "Indexing & Chunking", group: "system" },
    { id: "vectordb", label: "Vector Database", group: "system" },
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "workbench":
        return <SearchQATesting />;
      case "overview":
        return <QueryTestResults />;
      case "dataset-management":
        return <DatasetManagement />;
      case "qa-validation":
        return <QAValidation />;
      case "qa-evaluation":
        return <QAEvaluation />;
      case 'option1Eval':
        return <Option1Eval />;
      case 'option2Eval':
        return <Option2Eval />;
      case 'comparison':
        return <ModelComparison />;
      case "indexing":
        return <IndexingChunking />;
      case "vectordb":
        return <VectorDatabaseEvaluation />;
      default:
        return <SearchQATesting />;
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
                <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
                  Multilingual Semantic Search Evaluation
                </h1>
              </div>

              <div className="flex items-center space-x-4">
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
        <div className="flex h-[calc(100vh-57px)]">
          {/* Left Sidebar Navigation - Always visible */}
          <aside className="w-56 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
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
          <main className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
