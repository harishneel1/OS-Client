"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";

const API_BASE_URL = "http://localhost:8000";

export default function NewChatPage() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  // Create new chat function
  const createNewChat = async () => {
    try {
      setError(null);
      setIsCreating(true);

      if (!user?.id) {
        setError("User not logged in");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Chat",
          project_id: null,
          clerk_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const savedChat = await response.json();

      // Navigate to the new chat
      router.push(`/chats/${savedChat.id}`);
    } catch (err) {
      setError("Failed to create new chat");
      console.error("Error creating chat:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Dummy send message function (won't be used since no chat exists)
  const sendMessage = async (content: string) => {
    // This shouldn't be called, but we need it for the interface
    console.log("Send message called on new chat page:", content);
  };

  return (
    <ChatInterface
      onSendMessage={sendMessage}
      isLoading={isCreating}
      error={error}
      onDismissError={() => setError(null)}
      onCreateNewChat={createNewChat}
    />
  );
}
