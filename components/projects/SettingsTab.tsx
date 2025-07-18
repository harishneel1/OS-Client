import { Settings } from "lucide-react";
import { calculatePerformanceMetrics } from "../../lib/utils/calculatePerformanceMetrics";
import { LocalSettings } from "@/lib/types";

interface SettingsTabProps {
  localSettings: LocalSettings;
  settingsError: string | null;
  settingsLoading: boolean;
  onUpdateSettings: (key: string, value: any) => void;
  onUpdateNestedSettings: (
    category: "reranking" | "hybridSearch",
    key: string,
    value: any
  ) => void;
  onUpdateVectorWeight: (weight: number) => void;
  onApplySettings: () => void;
}

export function SettingsTab({
  localSettings,
  settingsError,
  settingsLoading,
  onUpdateSettings,
  onUpdateNestedSettings,
  onUpdateVectorWeight,
  onApplySettings,
}: SettingsTabProps) {
  const metrics = calculatePerformanceMetrics(localSettings);

  return (
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
      <div className={settingsLoading ? "opacity-50 pointer-events-none" : ""}>
        {/* Embedding Model */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Embedding Model
          </label>
          <select
            value={localSettings.embeddingModel}
            onChange={(e) => onUpdateSettings("embeddingModel", e.target.value)}
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
                    onUpdateSettings("ragStrategy", e.target.value)
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
                  onUpdateSettings("chunksPerSearch", parseInt(e.target.value))
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
                  onUpdateSettings("finalContextSize", parseInt(e.target.value))
                }
                disabled={settingsLoading}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Similarity Threshold: {localSettings.similarityThreshold}
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={localSettings.similarityThreshold}
                onChange={(e) =>
                  onUpdateSettings(
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
                  onUpdateSettings("numberOfQueries", parseInt(e.target.value))
                }
                disabled={settingsLoading}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Reranking */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Reranking</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localSettings.reranking.enabled}
                onChange={(e) =>
                  onUpdateNestedSettings(
                    "reranking",
                    "enabled",
                    e.target.checked
                  )
                }
                disabled={settingsLoading}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">Enable Reranking</span>
            </label>

            {localSettings.reranking.enabled && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Reranker Model
                </label>
                <select
                  value={localSettings.reranking.model}
                  onChange={(e) =>
                    onUpdateNestedSettings("reranking", "model", e.target.value)
                  }
                  disabled={settingsLoading}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="ms-marco-MiniLM-L-12-v2">
                    ms-marco-MiniLM-L-12-v2
                  </option>
                  <option value="bge-reranker-base">bge-reranker-base</option>
                  <option value="bge-reranker-large">bge-reranker-large</option>
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
                    onUpdateVectorWeight(parseFloat(e.target.value))
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
              <span className="text-gray-600">Total Chunks Retrieved:</span>
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
          onClick={onApplySettings}
          disabled={settingsLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Settings size={16} />
          {settingsLoading ? "Applying..." : "Apply RAG Settings"}
        </button>
      </div>
    </div>
  );
}
