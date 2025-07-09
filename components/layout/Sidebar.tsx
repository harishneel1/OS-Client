"use client";

import { UserButton } from "@clerk/nextjs";
import { MessageSquare, Plus } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <button className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors">
          <Plus size={16} />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat History (placeholder) */}
      <div className="flex-1 p-4">
        {!isCollapsed && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Recent Chats</p>
            <div className="text-sm text-gray-300">No chats yet...</div>
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
