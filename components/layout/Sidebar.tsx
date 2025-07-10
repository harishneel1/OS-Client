"use client";

import { UserButton } from "@clerk/nextjs";
import { MessageSquare, Plus, Folder } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useChatContext } from "../context/ChatContext";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { chats } = useChatContext();

  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = () => {
    router.push("/new");
  };

  const handleChatClick = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat?.projectId) {
      // Chat belongs to a project - use project URL structure
      router.push(`/projects/${chat.projectId}/chats/${chatId}`);
    } else {
      // Unorganized chat - use simple URL structure
      router.push(`/chats/${chatId}`);
    }
  };

  const handleProjectsClick = () => {
    router.push("/projects");
  };

  // Get current chat ID from URL (handles both URL structures)
  const getCurrentChatId = () => {
    if (pathname.startsWith("/project/") && pathname.includes("/chat/")) {
      return pathname.split("/chat/")[1];
    } else if (pathname.startsWith("/chat/")) {
      return pathname.split("/chat/")[1];
    }
    return null;
  };

  const currentChatId = getCurrentChatId();

  // Get all chats sorted by most recent activity
  const recentChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h1 className="text-lg font-semibold">ChatApp</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Navigation Tabs */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <nav className="space-y-1">
            <button
              onClick={handleProjectsClick}
              className={`w-full flex items-center gap-2 p-2 text-sm rounded transition-colors ${
                pathname === "/projects"
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Folder size={16} />
              <span>Projects</span>
            </button>
          </nav>
        </div>
      )}

      {/* Recent Chats Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Recent Chats</p>
            {recentChats.length === 0 ? (
              <div className="text-sm text-gray-500">No chats yet...</div>
            ) : (
              <div className="space-y-1">
                {recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      currentChatId === chat.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    <div className="truncate">{chat.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <UserButton />
          {!isCollapsed && (
            <span className="text-sm text-gray-300">Profile</span>
          )}
        </div>
      </div>
    </div>
  );
}
