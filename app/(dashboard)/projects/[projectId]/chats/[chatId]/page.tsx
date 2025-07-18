"use client";

import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatWithMessages } from "@/lib/types";
import { apiClient } from "@/lib/api";

const API_BASE_URL = "http://localhost:8000";

interface ProjectChatPageProps {
  params: Promise<{
    projectId: string;
    chatId: string;
  }>;
}

export default function ProjectChatPage({ params }: ProjectChatPageProps) {
  const { projectId, chatId } = use(params);
  const [chat, setChat] = useState<ChatWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { user } = useUser();

  // Load chat data
  const loadChat = async () => {
    try {
      if (!user?.id) return;

      const result = await apiClient.get(
        `/api/chats/${chatId}?clerk_id=${user.id}`
      );

      const chatData = result.data;

      // Verify this chat belongs to the project
      if (chatData.project_id !== projectId) {
        throw new Error("Chat does not belong to this project");
      }

      setChat(chatData);
    } catch (err) {
      setError("Failed to load chat.");
      console.error("Error loading chat:", err);
    }
  };

  // Send message function
  const sendMessage = async (content: string) => {
    try {
      setError(null);
      setIsSending(true);

      if (!chat || !user?.id) {
        setError("Chat or user not found");
        return;
      }

      const userMessageResult = await apiClient.post("/api/messages", {
        chat_id: chat.id,
        content,
        role: "user",
        clerk_id: user.id,
      });

      const userMessage = userMessageResult.data;

      // Update local state with user message
      setChat((prevChat) => ({
        ...prevChat!,
        messages: [...prevChat!.messages, userMessage],
        title:
          prevChat!.messages.length === 0
            ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
            : prevChat!.title,
        updated_at: new Date().toISOString(),
      }));

      // Simulate AI response (replace with real AI API later)
      setTimeout(async () => {
        try {
          const assistantResponse = await apiClient.post("/api/messages", {
            chat_id: chat.id,
            content: `I received your message: "${content}". This is a simulated response!`,
            role: "assistant",
            clerk_id: user.id,
          });

          const assistantMessage = assistantResponse.data;

          // Update local state with assistant message
          setChat((prevChat) => ({
            ...prevChat!,
            messages: [...prevChat!.messages, assistantMessage],
            updated_at: new Date().toISOString(),
          }));
        } catch (err) {
          setError("Failed to get AI response");
          console.error("Error getting AI response:", err);
        } finally {
          setIsSending(false);
        }
      }, 1000);
    } catch (err) {
      setError("Failed to send message");
      setIsSending(false);
      console.error("Error sending message:", err);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setLoading(true);
        await loadChat();
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, chatId, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chat not found</div>
      </div>
    );
  }

  return (
    <ChatInterface
      chat={chat}
      projectId={projectId}
      onSendMessage={sendMessage}
      isLoading={isSending}
      error={error}
      onDismissError={() => setError(null)}
    />
  );
}
