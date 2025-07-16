"use client";

import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ProjectView } from "../../../../components/projects/ProjectView";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

interface ProjectSettings {
  id: string;
  project_id: string;
  embedding_model: string;
  rag_strategy: string;
  chunks_per_search: number;
  final_context_size: number;
  similarity_threshold: number;
  number_of_queries: number;
  reranking_enabled: boolean;
  reranking_model: string;
  vector_weight: number;
  keyword_weight: number;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "http://localhost:8000";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [projectChats, setProjectChats] = useState<Chat[]>([]);
  const [projectSettings, setProjectSettings] =
    useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  // Load project details
  const loadProject = async () => {
    if (!user?.id) return;

    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}?clerk_id=${user.id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load project");
    }

    const result = await response.json();
    setProject(result.data);
  };

  // Load project chats
  const loadProjectChats = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/chats`
    );

    if (!response.ok) {
      throw new Error("Failed to load project chats");
    }

    const result = await response.json();
    setProjectChats(result.data);
  };

  // Load project settings
  const loadProjectSettings = async () => {
    if (!user?.id) return;

    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/settings?clerk_id=${user.id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load project settings");
    }

    const result = await response.json();
    setProjectSettings(result.data);
  };

  // Save project settings
  const saveProjectSettings = async (settings: Partial<ProjectSettings>) => {
    try {
      setSettingsError(null);
      setSettingsLoading(true);

      if (!user?.id) {
        setSettingsError("User not logged in");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/settings?clerk_id=${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save project settings");
      }

      const result = await response.json();
      setProjectSettings(result.data);
      alert("RAG Settings Applied Successfully!");
    } catch (err) {
      setSettingsError("Failed to save project settings");
      console.error("Error saving project settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Create new chat
  const createNewChat = async () => {
    try {
      setError(null);
      setIsCreatingChat(true);

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
          project_id: projectId,
          clerk_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const result = await response.json();
      const savedChat = result.data;

      // Navigate to the new chat immediately
      router.push(`/projects/${projectId}/chats/${savedChat.id}`);
    } catch (err) {
      setError("Failed to create new chat");
      console.error("Error creating chat:", err);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle chat click
  const handleChatClick = (chatId: string) => {
    router.push(`/projects/${projectId}/chats/${chatId}`);
  };

  // Load data when user is available
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          await Promise.all([
            loadProject(),
            loadProjectChats(),
            loadProjectSettings(),
          ]);
        } catch (err) {
          setError("Failed to load project data");
          console.error("Error loading project data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user?.id, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }
  console.log(projectSettings, "projectSettings");

  return (
    <ProjectView
      project={project}
      projectChats={projectChats}
      projectSettings={projectSettings}
      error={error}
      settingsError={settingsError}
      settingsLoading={settingsLoading}
      isCreatingChat={isCreatingChat}
      onCreateNewChat={createNewChat}
      onChatClick={handleChatClick}
      onSaveSettings={saveProjectSettings}
    />
  );
}
