"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  FileText,
  Lock,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatContext } from "../context/ChatContext";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "settings">(
    "documents"
  );

  const router = useRouter();
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

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  const handleCreateNewChat = async () => {
    await createNewChat(projectId);
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/projects/${projectId}/chats/${chatId}`);
  };

  // Loading state
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <div className="flex items-center mb-4">
              <button
                onClick={handleBackToProjects}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" />
                All projects
              </button>
            </div>

            {/* Project Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentProject.name}
              </h1>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Private
              </span>
            </div>

            {currentProject.description && (
              <p className="text-gray-600 mt-2">{currentProject.description}</p>
            )}
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
                            {chat.messages.length > 0 && (
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {chat.messages[
                                  chat.messages.length - 1
                                ]?.content?.slice(0, 150)}
                                {chat.messages[chat.messages.length - 1]
                                  ?.content?.length > 150
                                  ? "..."
                                  : ""}
                              </p>
                            )}
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

      {/* Right Sidebar - Knowledge Base */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Knowledge Base
            </h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
            <div className="mb-4">
              <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            </div>

            <p className="text-gray-900 text-sm font-medium mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-gray-500 text-xs">
              PDF, DOCX, TXT, MD supported
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "documents"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "documents" ? (
            /* Documents Tab Content */
            <div className="space-y-3">
              {/* Sample Documents */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Employment_Contract_Template.pdf
                    </div>
                    <div className="text-xs text-gray-500">
                      2.3 MB • Processed
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Privacy_Policy_2024.docx
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      1.8 MB • Processing...
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Settings Tab Content */
            <div className="space-y-6">
              {/* Embedding Model */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">
                    Embedding Model
                  </span>
                </div>
                <div className="relative">
                  <select
                    disabled
                    className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  >
                    <option>text-embedding-3-large</option>
                  </select>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked after first document upload
                  </div>
                </div>
              </div>

              {/* Search Strategy */}
              <div>
                <div className="text-sm font-bold text-gray-900 mb-4">
                  Search Strategy
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">
                      Vector Search (RAG)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Basic</span>
                      <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Hybrid Search</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Intermediate
                      </span>
                      <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">
                      Reciprocal Rank Fusion (RRF)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Intermediate
                      </span>
                      <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Adaptive RAG</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Advanced</span>
                      <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
