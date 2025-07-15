"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ErrorDisplay } from "./ErrorDisplay";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  chat_id: string;
  clerk_id: string;
}

interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

interface ChatInterfaceProps {
  chat?: Chat;
  projectId?: string;
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onDismissError: () => void;
  onCreateNewChat?: () => void;
}

export function ChatInterface({
  chat,
  projectId,
  onSendMessage,
  isLoading,
  error,
  onDismissError,
  onCreateNewChat,
}: ChatInterfaceProps) {
  const handleSendMessage = async (content: string) => {
    await onSendMessage(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - only show if we have projectId */}
      {projectId && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">P</span>
            </div>
            <div>
              <h1 className="font-medium text-gray-900">Project Chat</h1>
              {chat && <p className="text-sm text-gray-500">{chat.title}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && <ErrorDisplay error={error} onDismiss={onDismissError} />}

      {/* Chat Content */}
      {chat ? (
        <>
          <MessageList messages={chat.messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to ChatApp
            </h2>
            <p className="text-gray-600 mb-4">
              Start a new conversation to begin chatting
            </p>
            {onCreateNewChat && (
              <button
                onClick={onCreateNewChat}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isLoading ? "Creating..." : "Start New Chat"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
