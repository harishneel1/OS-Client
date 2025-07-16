import { FileText, Plus } from "lucide-react";
import { DocumentsTab } from "./DocumentsTab";
import { SettingsTab } from "./SettingsTab";

interface LocalSettings {
  embeddingModel: string;
  ragStrategy: string;
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

interface KnowledgeBaseSidebarProps {
  activeTab: "documents" | "settings";
  localSettings: LocalSettings;
  settingsError: string | null;
  settingsLoading: boolean;
  onSetActiveTab: (tab: "documents" | "settings") => void;
  onUpdateSettings: (key: string, value: any) => void;
  onUpdateNestedSettings: (
    category: "reranking" | "hybridSearch",
    key: string,
    value: any
  ) => void;
  onUpdateVectorWeight: (weight: number) => void;
  onApplySettings: () => void;
}

export function KnowledgeBaseSidebar({
  activeTab,
  localSettings,
  settingsError,
  settingsLoading,
  onSetActiveTab,
  onUpdateSettings,
  onUpdateNestedSettings,
  onUpdateVectorWeight,
  onApplySettings,
}: KnowledgeBaseSidebarProps) {
  return (
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
          onClick={() => onSetActiveTab("documents")}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => onSetActiveTab("settings")}
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
          <DocumentsTab />
        ) : (
          <SettingsTab
            localSettings={localSettings}
            settingsError={settingsError}
            settingsLoading={settingsLoading}
            onUpdateSettings={onUpdateSettings}
            onUpdateNestedSettings={onUpdateNestedSettings}
            onUpdateVectorWeight={onUpdateVectorWeight}
            onApplySettings={onApplySettings}
          />
        )}
      </div>
    </div>
  );
}
