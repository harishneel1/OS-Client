"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ErrorDisplay } from "./ErrorDisplay";
import { useChatContext } from "../context/ChatContext";
import { useEffect } from "react";

interface ChatInterfaceProps {
  chatId?: string;
  projectId?: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const {
    getCurrentChat,
    sendMessage,
    isLoading,
    createNewChat,
    error,
    setError,
    switchToChat,
  } = useChatContext();

  useEffect(() => {
    if (chatId) {
      switchToChat(chatId);
    }
  }, [chatId, switchToChat]);

  const currentChat = getCurrentChat();

  return (
    <div className="flex flex-col h-full">
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError && setError(null)}
        />
      )}

      {currentChat ? (
        <>
          <MessageList messages={currentChat.messages} isLoading={isLoading} />
          <ChatInput
            chatId={currentChat.id}
            onSendMessage={sendMessage}
            disabled={isLoading}
          />
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
            <button
              onClick={() => createNewChat()}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isLoading ? "Creating..." : "Start New Chat"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
