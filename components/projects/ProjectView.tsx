"use client";

import React, { useState } from "react";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectChatSection } from "./ProjectChatSection";
import { KnowledgeBaseSidebar } from "./KnowledgeBaseSidebar";
import { Project, Chat, ProjectSettings, ProjectDocument } from "@/lib/types";

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
  projectDocuments: ProjectDocument[];
  uploading: boolean;
  onFileUpload: (files: File[]) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
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
  projectDocuments,
  uploading,
  onFileUpload,
  onFileDelete,
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Project Chat Section */}
        <ProjectChatSection
          projectChats={projectChats}
          isCreatingChat={isCreatingChat}
          onCreateNewChat={onCreateNewChat}
          onChatClick={onChatClick}
        />
      </div>

      {/* Knowledge Base Sidebar */}
      <KnowledgeBaseSidebar
        activeTab={activeTab}
        localSettings={localSettings}
        settingsError={settingsError}
        settingsLoading={settingsLoading}
        onSetActiveTab={setActiveTab}
        onUpdateSettings={updateSettings}
        onUpdateNestedSettings={updateNestedSettings}
        onUpdateVectorWeight={updateVectorWeight}
        onApplySettings={handleApplySettings}
        projectDocuments={projectDocuments}
        uploading={uploading}
        onFileUpload={onFileUpload}
        onFileDelete={onFileDelete}
      />
    </div>
  );
}
