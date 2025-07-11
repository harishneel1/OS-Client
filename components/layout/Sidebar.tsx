"use client";

import { UserButton } from "@clerk/nextjs";
import {
  MessageSquare,
  Plus,
  Folder,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useChatContext } from "../context/ChatContext";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { chats } = useChatContext();

  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = () => {
    router.push("/new");
  };

  const handleChatClick = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat?.projectId) {
      router.push(`/projects/${chat.projectId}/chats/${chatId}`);
    } else {
      router.push(`/chats/${chatId}`);
    }
  };

  const handleProjectsClick = () => {
    router.push("/projects");
  };

  const handleDeleteChat = async (chatId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete chat:", chatId);
    setActiveDropdown(null);
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
      <div className="p-3 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-lg font-medium">Enterprise RAG</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800 rounded-md transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleNewChat}
          className={`w-full bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 ${
            isCollapsed ? "p-3 justify-center" : "p-3"
          }`}
        >
          <Plus size={16} />
          {!isCollapsed && <span>New chat</span>}
        </button>
      </div>

      {/* Navigation */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 p-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
              <MessageSquare size={16} />
              <span>Chats</span>
            </button>
            <button
              onClick={handleProjectsClick}
              className={`w-full flex items-center gap-3 p-2 text-sm rounded-md transition-colors ${
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

      {/* Recents */}
      <div className="flex-1 overflow-hidden">
        {!isCollapsed && (
          <div className="h-full flex flex-col">
            <div className="px-3 pb-2">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Recents
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {recentChats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No chats yet</p>
                </div>
              ) : (
                recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative flex items-center rounded-md transition-colors ${
                      currentChatId === chat.id
                        ? "bg-gray-800"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <button
                      onClick={() => handleChatClick(chat.id)}
                      className="flex-1 text-left p-2 text-sm truncate"
                    >
                      {chat.title}
                    </button>

                    {/* Three dots menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(
                            activeDropdown === chat.id ? null : chat.id
                          );
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-all"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === chat.id && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          />

                          {/* Dropdown */}
                          <div className="absolute right-0 top-6 z-20 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 min-w-[120px]">
                            <button
                              onClick={() => handleDeleteChat(chat.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-gray-800">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <UserButton />
          {!isCollapsed && (
            <span className="text-sm text-gray-300">Profile</span>
          )}
        </div>
      </div>
    </div>
  );
}
