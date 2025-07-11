"use client";

import { useEffect } from "react";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatContext } from "../context/ChatContext";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
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
      <div className="w-80 bg-gray-900 border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Project knowledge
            </h2>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Plus size={20} />
            </button>
          </div>

          {/* Set project instructions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">
                Set project instructions
              </span>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-500"
              >
                <path
                  d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14,2 14,8 20,8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            No knowledge added yet. Add PDFs, documents, or other text to the
            project knowledge base that Claude will reference in every project
            conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
