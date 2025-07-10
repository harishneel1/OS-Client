"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface Chat {
  id: string;
  projectId: string | null;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  chats: Chat[];
  projects: Project[];
  currentChatId: string | null;
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Chat operations
  createNewChat: (projectId?: string | null) => Promise<void>;
  switchToChat: (chatId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  getCurrentChat: () => Chat | undefined;
  loadChats: () => Promise<void>;

  // 🆕 Project operations
  loadProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
  switchToProject: (projectId: string | null) => void;
  getCurrentProject: () => Project | undefined;
  getProjectChats: (projectId: string | null) => Chat[];
  getUnorganizedChats: () => Chat[];

  setError: (error: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

const API_BASE_URL = "http://localhost:3001";

export function ChatProvider({ children }: ChatProviderProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // 🆕 Projects state
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null); // 🆕 Current project state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Load chats and projects on mount
  useEffect(() => {
    loadChats();
    loadProjects(); // 🆕 Load projects on mount
  }, []);

  // Sync currentChatId with URL
  useEffect(() => {
    if (pathname.startsWith("/chat/")) {
      const chatIdFromUrl = pathname.split("/chat/")[1];
      if (chatIdFromUrl !== currentChatId) {
        setCurrentChatId(chatIdFromUrl);
      }
    } else if (pathname === "/new") {
      setCurrentChatId(null);
    }
  }, [pathname, currentChatId]);

  // 🆕 Helper functions for project-chat relationships
  const getProjectChats = (projectId: string | null): Chat[] => {
    return chats.filter((chat) => chat.projectId === projectId);
  };

  const getUnorganizedChats = (): Chat[] => {
    return chats.filter((chat) => chat.projectId === null);
  };

  const getCurrentProject = (): Project | undefined => {
    if (!currentProjectId) return undefined;
    return projects.find((project) => project.id === currentProjectId);
  };

  const loadChats = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/chats`);
      if (!response.ok) {
        throw new Error("Failed to load chats");
      }
      const chatsData = await response.json();
      setChats(chatsData);
    } catch (err) {
      setError("Failed to load chats. Make sure JSON server is running.");
      console.error("Error loading chats:", err);
    }
  };

  // 🆕 Load projects from API
  const loadProjects = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error("Failed to load projects");
      }
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (err) {
      setError("Failed to load projects.");
      console.error("Error loading projects:", err);
    }
  };

  // 🆕 Create new project
  const createProject = async (name: string, description: string) => {
    try {
      setError(null);
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const savedProject = await response.json();
      setProjects((prev) => [savedProject, ...prev]);
      setCurrentProjectId(savedProject.id);
    } catch (err) {
      setError("Failed to create project");
      console.error("Error creating project:", err);
    }
  };

  // 🆕 Switch to project
  const switchToProject = (projectId: string | null) => {
    setCurrentProjectId(projectId);
  };

  const createNewChat = async (projectId: string | null = null) => {
    // 🆕 Added projectId parameter
    try {
      setError(null);
      const newChat: Chat = {
        id: Date.now().toString(),
        projectId, // 🆕 Set the projectId
        title: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChat),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const savedChat = await response.json();
      setChats((prev) => [savedChat, ...prev]);
      setCurrentChatId(savedChat.id);

      // Navigate to the new chat
      router.push(`/chat/${savedChat.id}`);
    } catch (err) {
      setError("Failed to create new chat");
      console.error("Error creating chat:", err);
    }
  };

  const switchToChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId);
  };

  const updateChatInServer = async (updatedChat: Chat) => {
    const response = await fetch(`${API_BASE_URL}/chats/${updatedChat.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedChat),
    });

    if (!response.ok) {
      throw new Error("Failed to update chat");
    }

    return response.json();
  };

  const sendMessage = async (content: string) => {
    // Early return if no current chat
    if (!currentChatId) {
      console.error("No current chat selected");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Find current chat
      const currentChat = chats.find((chat) => chat.id === currentChatId);
      if (!currentChat) {
        setError("Chat not found");
        setIsLoading(false);
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date().toISOString(),
      };

      // Update chat with user message and title if it's the first message
      const updatedChat: Chat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        title:
          currentChat.messages.length === 0
            ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
            : currentChat.title,
        updatedAt: new Date().toISOString(),
      };

      // Update in server
      await updateChatInServer(updatedChat);

      // Update local state
      setChats((prev) =>
        prev.map((chat) => (chat.id === currentChatId ? updatedChat : chat))
      );

      // Simulate AI response (replace this with real AI API later)
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
            updatedAt: new Date().toISOString(),
          };

          // Update in server
          await updateChatInServer(finalChat);

          // Update local state
          setChats((prev) =>
            prev.map((chat) => (chat.id === currentChatId ? finalChat : chat))
          );

          setIsLoading(false);
        } catch (err) {
          setError("Failed to get AI response");
          setIsLoading(false);
          console.error("Error getting AI response:", err);
        }
      }, 1000);
    } catch (err) {
      setError("Failed to send message");
      setIsLoading(false);
      console.error("Error sending message:", err);
    }
  };

  const value: ChatContextType = {
    chats,
    projects,
    currentChatId,
    currentProjectId,
    isLoading,
    error,
    createNewChat,
    switchToChat,
    sendMessage,
    getCurrentChat,
    loadChats,
    loadProjects,
    createProject,
    switchToProject,
    getCurrentProject,
    getProjectChats,
    getUnorganizedChats,
    setError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
