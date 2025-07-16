"use client";

import React, { useState } from "react";
import { Settings, Upload, FileText, Plus, MessageSquare } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

interface ProjectSettings {
  id: string;
  project_id: string;
  embedding_model: string;
  rag_strategy: string;
  chunks_per_search: number;
  final_context_size: number;
  similarity_threshold: number;
  number_of_queries: number;
  reranking_enabled: boolean;
  reranking_model: string;
  vector_weight: number;
  keyword_weight: number;
  created_at: string;
  updated_at: string;
}

interface ProjectViewProps {
  project: Project;
  projectChats: Chat[];
  projectSettings: ProjectSettings | null;
  error: string | null;
  settingsError: string | null;
  settingsLoading: boolean;
  isCreatingChat: boolean;
  onCreateNewChat: () => void;
  onChatClick: (chatId: string) => void;
  onSaveSettings: (settings: Partial<ProjectSettings>) => void;
}

export function ProjectView({
  project,
  projectChats,
  projectSettings,
  error,
  settingsError,
  settingsLoading,
  isCreatingChat,
  onCreateNewChat,
  onChatClick,
  onSaveSettings,
}: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "settings">(
    "documents"
  );

  // Initialize local settings state with real data or defaults
  const [localSettings, setLocalSettings] = useState(() => {
    if (projectSettings) {
      return {
        embeddingModel: projectSettings.embedding_model,
        ragStrategy: projectSettings.rag_strategy,
        chunksPerSearch: projectSettings.chunks_per_search,
        finalContextSize: projectSettings.final_context_size,
        similarityThreshold: projectSettings.similarity_threshold,
        numberOfQueries: projectSettings.number_of_queries,
        reranking: {
          enabled: projectSettings.reranking_enabled,
          model: projectSettings.reranking_model,
        },
        hybridSearch: {
          vectorWeight: projectSettings.vector_weight,
          keywordWeight: projectSettings.keyword_weight,
        },
      };
    }
    // Default settings if none loaded yet
    return {
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
    };
  });

  // Update local settings when projectSettings changes
  React.useEffect(() => {
    if (projectSettings) {
      setLocalSettings({
        embeddingModel: projectSettings.embedding_model,
        ragStrategy: projectSettings.rag_strategy,
        chunksPerSearch: projectSettings.chunks_per_search,
        finalContextSize: projectSettings.final_context_size,
        similarityThreshold: projectSettings.similarity_threshold,
        numberOfQueries: projectSettings.number_of_queries,
        reranking: {
          enabled: projectSettings.reranking_enabled,
          model: projectSettings.reranking_model,
        },
        hybridSearch: {
          vectorWeight: projectSettings.vector_weight,
          keywordWeight: projectSettings.keyword_weight,
        },
      });
    }
  }, [projectSettings]);

  const updateSettings = (key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = (
    category: "reranking" | "hybridSearch",
    key: string,
    value: any
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateVectorWeight = (weight: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      hybridSearch: {
        vectorWeight: weight,
        keywordWeight: 1 - weight,
      },
    }));
  };

  const calculatePerformanceMetrics = () => {
    const { ragStrategy, chunksPerSearch, numberOfQueries, reranking } =
      localSettings;

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
    // Convert local settings format to API format
    const apiSettings = {
      embedding_model: localSettings.embeddingModel,
      rag_strategy: localSettings.ragStrategy,
      chunks_per_search: localSettings.chunksPerSearch,
      final_context_size: localSettings.finalContextSize,
      similarity_threshold: localSettings.similarityThreshold,
      number_of_queries: localSettings.numberOfQueries,
      reranking_enabled: localSettings.reranking.enabled,
      reranking_model: localSettings.reranking.model,
      vector_weight: localSettings.hybridSearch.vectorWeight,
      keyword_weight: localSettings.hybridSearch.keywordWeight,
    };

    onSaveSettings(apiSettings);
  };

  const metrics = calculatePerformanceMetrics();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                🔒 Private
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Create New Chat Button */}
            <div className="mb-6">
              <button
                onClick={onCreateNewChat}
                disabled={isCreatingChat}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                {isCreatingChat ? "Creating..." : "Create new chat"}
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
                    onClick={onCreateNewChat}
                    disabled={isCreatingChat}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} className="inline mr-2" />
                    {isCreatingChat ? "Creating..." : "Create new chat"}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projectChats
                    .sort(
                      (a, b) =>
                        new Date(b.updated_at).getTime() -
                        new Date(a.updated_at).getTime()
                    )
                    .map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => onChatClick(chat.id)}
                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {chat.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                Updated{" "}
                                {new Date(chat.updated_at).toLocaleDateString()}
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
              {/* Settings Error Display */}
              {settingsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-red-700 text-sm">{settingsError}</span>
                </div>
              )}

              {/* Loading State */}
              {settingsLoading && (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading...</div>
                </div>
              )}

              {/* Settings Form - disabled when loading */}
              <div
                className={
                  settingsLoading ? "opacity-50 pointer-events-none" : ""
                }
              >
                {/* Embedding Model */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embedding Model
                  </label>
                  <select
                    value={localSettings.embeddingModel}
                    onChange={(e) =>
                      updateSettings("embeddingModel", e.target.value)
                    }
                    disabled={settingsLoading}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
                <div className="mb-6">
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
                          checked={localSettings.ragStrategy === strategy.value}
                          onChange={(e) =>
                            updateSettings("ragStrategy", e.target.value)
                          }
                          disabled={settingsLoading}
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
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Retrieval Parameters
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Chunks per Search: {localSettings.chunksPerSearch}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={localSettings.chunksPerSearch}
                        onChange={(e) =>
                          updateSettings(
                            "chunksPerSearch",
                            parseInt(e.target.value)
                          )
                        }
                        disabled={settingsLoading}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Final Context Size: {localSettings.finalContextSize}
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="15"
                        value={localSettings.finalContextSize}
                        onChange={(e) =>
                          updateSettings(
                            "finalContextSize",
                            parseInt(e.target.value)
                          )
                        }
                        disabled={settingsLoading}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Similarity Threshold:{" "}
                        {localSettings.similarityThreshold}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.05"
                        value={localSettings.similarityThreshold}
                        onChange={(e) =>
                          updateSettings(
                            "similarityThreshold",
                            parseFloat(e.target.value)
                          )
                        }
                        disabled={settingsLoading}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Multi-Query Settings */}
                {(localSettings.ragStrategy === "multi-query-vector" ||
                  localSettings.ragStrategy === "multi-query-hybrid") && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Multi-Query Settings
                    </h3>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Number of Queries: {localSettings.numberOfQueries}
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="7"
                        value={localSettings.numberOfQueries}
                        onChange={(e) =>
                          updateSettings(
                            "numberOfQueries",
                            parseInt(e.target.value)
                          )
                        }
                        disabled={settingsLoading}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {/* Reranking */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Reranking
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={localSettings.reranking.enabled}
                        onChange={(e) =>
                          updateNestedSettings(
                            "reranking",
                            "enabled",
                            e.target.checked
                          )
                        }
                        disabled={settingsLoading}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">
                        Enable Reranking
                      </span>
                    </label>

                    {localSettings.reranking.enabled && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Reranker Model
                        </label>
                        <select
                          value={localSettings.reranking.model}
                          onChange={(e) =>
                            updateNestedSettings(
                              "reranking",
                              "model",
                              e.target.value
                            )
                          }
                          disabled={settingsLoading}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
                {(localSettings.ragStrategy === "hybrid" ||
                  localSettings.ragStrategy === "multi-query-hybrid") && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Hybrid Search
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Vector Weight:{" "}
                          {localSettings.hybridSearch.vectorWeight.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.1"
                          value={localSettings.hybridSearch.vectorWeight}
                          onChange={(e) =>
                            updateVectorWeight(parseFloat(e.target.value))
                          }
                          disabled={settingsLoading}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Keyword Weight:{" "}
                        {localSettings.hybridSearch.keywordWeight.toFixed(1)}{" "}
                        (auto-calculated)
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Impact */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Performance Impact
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Chunks Retrieved:
                      </span>
                      <span className="font-medium">
                        ~{metrics.totalChunks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        After Deduplication:
                      </span>
                      <span className="font-medium">
                        ~{metrics.afterDedupe}
                      </span>
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
                  disabled={settingsLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Settings size={16} />
                  {settingsLoading ? "Applying..." : "Apply RAG Settings"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
