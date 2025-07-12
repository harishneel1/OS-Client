"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Upload, FileText, Plus, MessageSquare } from "lucide-react";
import { useChatContext } from "../context/ChatContext";

interface RAGSettings {
  embeddingModel: string;
  ragStrategy: "basic" | "hybrid" | "multi-query-vector" | "multi-query-hybrid";
  chunksPerSearch: number;
  finalContextSize: number;
  similarityThreshold: number;
  numberOfQueries: number;
  reranking: {
    enabled: boolean;
    model: string;
  };
  hybridSearch: {
    vectorWeight: number;
    keywordWeight: number;
  };
}

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"documents" | "settings">(
    "documents"
  );
  const [settings, setSettings] = useState<RAGSettings>({
    embeddingModel: "text-embedding-3-large",
    ragStrategy: "basic",
    chunksPerSearch: 20,
    finalContextSize: 5,
    similarityThreshold: 0.8,
    numberOfQueries: 5,
    reranking: {
      enabled: false,
      model: "ms-marco-MiniLM-L-12-v2",
    },
    hybridSearch: {
      vectorWeight: 0.7,
      keywordWeight: 0.3,
    },
  });

  const {
    getProjectChats,
    getCurrentProject,
    switchToProject,
    createNewChat,
    isLoading,
  } = useChatContext();

  // Load project data when component mounts
  useEffect(() => {
    switchToProject(projectId);
  }, [projectId, switchToProject]);

  const currentProject = getCurrentProject();
  const projectChats = getProjectChats(projectId);

  const updateSettings = (key: keyof RAGSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = (
    category: "reranking" | "hybridSearch",
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateVectorWeight = (weight: number) => {
    setSettings((prev) => ({
      ...prev,
      hybridSearch: {
        vectorWeight: weight,
        keywordWeight: 1 - weight,
      },
    }));
  };

  const calculatePerformanceMetrics = () => {
    const { ragStrategy, chunksPerSearch, numberOfQueries, reranking } =
      settings;

    let totalChunks = chunksPerSearch;
    let afterDedupe = chunksPerSearch;
    let latency = 400; // Base latency
    let strategyLevel = "Basic";

    switch (ragStrategy) {
      case "basic":
        strategyLevel = "Basic";
        break;
      case "hybrid":
        latency = 600;
        strategyLevel = "Intermediate";
        break;
      case "multi-query-vector":
        totalChunks = chunksPerSearch * numberOfQueries;
        afterDedupe = Math.floor(totalChunks * 0.7); // Assume 70% unique
        latency = 800 + numberOfQueries * 200;
        strategyLevel = "Advanced";
        break;
      case "multi-query-hybrid":
        totalChunks = chunksPerSearch * numberOfQueries;
        afterDedupe = Math.floor(totalChunks * 0.7);
        latency = 1000 + numberOfQueries * 300;
        strategyLevel = "Expert";
        break;
    }

    if (reranking.enabled) {
      latency += 200;
    }

    return { totalChunks, afterDedupe, latency, strategyLevel };
  };

  const handleApplySettings = () => {
    // This would typically send settings to your backend/context
    console.log("Applying RAG Settings for project:", projectId, settings);
    alert("RAG Settings Applied Successfully!");
  };

  const handleCreateNewChat = async () => {
    await createNewChat(projectId);
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/projects/${projectId}/chats/${chatId}`);
  };

  const metrics = calculatePerformanceMetrics();

  // Loading state
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentProject.name}
              </h1>
              <p className="text-gray-600 mt-1">{currentProject.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                🔒 Private
              </span>
            </div>
          </div>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Create New Chat Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateNewChat}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                {isLoading ? "Creating..." : "Create new chat"}
              </button>
            </div>

            {/* Chat List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chat History ({projectChats.length})
              </h2>

              {projectChats.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <MessageSquare
                      size={48}
                      className="mx-auto text-gray-300"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No chats yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start your first conversation in this project
                  </p>
                  <button
                    onClick={handleCreateNewChat}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} className="inline mr-2" />
                    {isLoading ? "Creating..." : "Create new chat"}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projectChats
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    )
                    .map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {chat.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{chat.messages.length} messages</span>
                              <span>
                                Updated{" "}
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <MessageSquare
                              size={20}
                              className="text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            Knowledge Base
            <Plus
              size={16}
              className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer"
            />
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "documents" ? (
            <div className="p-4 space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOCX, TXT, MD supported
                </p>
              </div>

              {/* Documents List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {/* Document Item 1 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          research-paper.pdf
                        </p>
                        <p className="text-xs text-gray-500">
                          2.3 MB • Uploaded 2 hours ago
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.02A1.5 1.5 0 0 0 4.551 15h6.898a1.5 1.5 0 0 0 1.498-1.328l.557-10.02a.58.58 0 0 0-.01-1.152H11Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Document Item 2 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          project-notes.md
                        </p>
                        <p className="text-xs text-gray-500">
                          156 KB • Uploaded 1 day ago
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.02A1.5 1.5 0 0 0 4.551 15h6.898a1.5 1.5 0 0 0 1.498-1.328l.557-10.02a.58.58 0 0 0-.01-1.152H11Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Document Item 3 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          documentation.docx
                        </p>
                        <p className="text-xs text-gray-500">
                          3.7 MB • Uploaded 3 days ago
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.02A1.5 1.5 0 0 0 4.551 15h6.898a1.5 1.5 0 0 0 1.498-1.328l.557-10.02a.58.58 0 0 0-.01-1.152H11Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Embedding Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embedding Model
                </label>
                <select
                  value={settings.embeddingModel}
                  onChange={(e) =>
                    updateSettings("embeddingModel", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text-embedding-3-large">
                    text-embedding-3-large
                  </option>
                  <option value="text-embedding-3-small">
                    text-embedding-3-small
                  </option>
                  <option value="text-embedding-ada-002">
                    text-embedding-ada-002
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Locked after first document upload
                </p>
              </div>

              {/* RAG Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RAG Strategy
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "basic",
                      label: "Basic Vector Search",
                      description: "Simple semantic search",
                    },
                    {
                      value: "hybrid",
                      label: "Hybrid Search (Vector + BM25)",
                      description: "Semantic + keyword matching",
                    },
                    {
                      value: "multi-query-vector",
                      label: "Multi-Query (Vector Only)",
                      description: "Multiple queries, vector search",
                    },
                    {
                      value: "multi-query-hybrid",
                      label: "Multi-Query (Hybrid)",
                      description: "Multiple queries, hybrid search",
                    },
                  ].map((strategy) => (
                    <label
                      key={strategy.value}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="ragStrategy"
                        value={strategy.value}
                        checked={settings.ragStrategy === strategy.value}
                        onChange={(e) =>
                          updateSettings("ragStrategy", e.target.value)
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {strategy.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {strategy.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Retrieval Parameters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Retrieval Parameters
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Chunks per Search: {settings.chunksPerSearch}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={settings.chunksPerSearch}
                      onChange={(e) =>
                        updateSettings(
                          "chunksPerSearch",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Final Context Size: {settings.finalContextSize}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={settings.finalContextSize}
                      onChange={(e) =>
                        updateSettings(
                          "finalContextSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Similarity Threshold: {settings.similarityThreshold}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="0.95"
                      step="0.05"
                      value={settings.similarityThreshold}
                      onChange={(e) =>
                        updateSettings(
                          "similarityThreshold",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Query Settings */}
              {(settings.ragStrategy === "multi-query-vector" ||
                settings.ragStrategy === "multi-query-hybrid") && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Multi-Query Settings
                  </h3>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Number of Queries: {settings.numberOfQueries}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="7"
                      value={settings.numberOfQueries}
                      onChange={(e) =>
                        updateSettings(
                          "numberOfQueries",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              )}

              {/* Reranking */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Reranking
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.reranking.enabled}
                      onChange={(e) =>
                        updateNestedSettings(
                          "reranking",
                          "enabled",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Enable Reranking
                    </span>
                  </label>

                  {settings.reranking.enabled && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Reranker Model
                      </label>
                      <select
                        value={settings.reranking.model}
                        onChange={(e) =>
                          updateNestedSettings(
                            "reranking",
                            "model",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="ms-marco-MiniLM-L-12-v2">
                          ms-marco-MiniLM-L-12-v2
                        </option>
                        <option value="bge-reranker-base">
                          bge-reranker-base
                        </option>
                        <option value="bge-reranker-large">
                          bge-reranker-large
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Hybrid Search Settings */}
              {(settings.ragStrategy === "hybrid" ||
                settings.ragStrategy === "multi-query-hybrid") && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Hybrid Search
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Vector Weight:{" "}
                        {settings.hybridSearch.vectorWeight.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={settings.hybridSearch.vectorWeight}
                        onChange={(e) =>
                          updateVectorWeight(parseFloat(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Keyword Weight:{" "}
                      {settings.hybridSearch.keywordWeight.toFixed(1)}{" "}
                      (auto-calculated)
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Impact */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Performance Impact
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total Chunks Retrieved:
                    </span>
                    <span className="font-medium">~{metrics.totalChunks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">After Deduplication:</span>
                    <span className="font-medium">~{metrics.afterDedupe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Latency:</span>
                    <span className="font-medium">~{metrics.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Strategy Level:</span>
                    <span
                      className={`font-medium ${
                        metrics.strategyLevel === "Basic"
                          ? "text-green-600"
                          : metrics.strategyLevel === "Intermediate"
                          ? "text-blue-600"
                          : metrics.strategyLevel === "Advanced"
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {metrics.strategyLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply Settings Button */}
              <button
                onClick={handleApplySettings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Settings size={16} />
                Apply RAG Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
