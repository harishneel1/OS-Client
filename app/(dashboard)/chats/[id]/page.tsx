"use client";

import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ChatInterface } from "@/components/chat/ChatInterface";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
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

const API_BASE_URL = "http://localhost:8000";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { user } = useUser();

  // Load chat data
  const loadChat = async () => {
    try {
      if (!user?.id) return;

      const response = await fetch(`${API_BASE_URL}/api/chats/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const chatData = await response.json();

      // Verify this chat belongs to the user and is not part of a project
      if (chatData.clerk_id !== user.id) {
        throw new Error("Chat not found or access denied");
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

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date().toISOString(),
      };

      // Update chat with user message
      const updatedChat: Chat = {
        ...chat,
        messages: [...chat.messages, userMessage],
        title:
          chat.messages.length === 0
            ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
            : chat.title,
        updated_at: new Date().toISOString(),
      };

      // Update in server
      const response = await fetch(`${API_BASE_URL}/api/chats/${chat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedChat),
      });

      if (!response.ok) {
        throw new Error("Failed to update chat");
      }

      // Update local state
      setChat(updatedChat);

      // Simulate AI response (replace with real AI API later)
      setTimeout(async () => {
        try {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `I received your message: "${content}". This is a simulated response from JSON server!`,
            role: "assistant",
            timestamp: new Date().toISOString(),
          };

          const finalChat: Chat = {
            ...updatedChat,
            messages: [...updatedChat.messages, assistantMessage],
            updated_at: new Date().toISOString(),
          };

          // Update in server
          const finalResponse = await fetch(
            `${API_BASE_URL}/api/chats/${chat.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(finalChat),
            }
          );

          if (!finalResponse.ok) {
            throw new Error("Failed to get AI response");
          }

          // Update local state
          setChat(finalChat);
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
      setLoading(true);
      await loadChat();
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, id]);

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
      onSendMessage={sendMessage}
      isLoading={isSending}
      error={error}
      onDismissError={() => setError(null)}
    />
  );
}
