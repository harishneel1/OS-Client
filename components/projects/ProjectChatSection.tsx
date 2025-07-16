import { Plus, MessageSquare } from "lucide-react";

interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

interface ProjectChatSectionProps {
  projectChats: Chat[];
  isCreatingChat: boolean;
  onCreateNewChat: () => void;
  onChatClick: (chatId: string) => void;
}

export function ProjectChatSection({
  projectChats,
  isCreatingChat,
  onCreateNewChat,
  onChatClick,
}: ProjectChatSectionProps) {
  return (
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
                <MessageSquare size={48} className="mx-auto text-gray-300" />
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
                        <MessageSquare size={20} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
