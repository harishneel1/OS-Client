"use client";

import { UserButton } from "@clerk/nextjs";
import { MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { useChatContext } from "../context/ChatContext";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { chats, currentChatId, createNewChat, switchToChat } =
    useChatContext();

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
          onClick={createNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Recent Chats</p>
            {chats.length === 0 ? (
              <div className="text-sm text-gray-300">No chats yet...</div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => switchToChat(chat.id)}
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
