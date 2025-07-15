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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  // Load project details
  const loadProject = async () => {
    try {
      if (!user?.id) return;

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}?clerk_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load project");
      }

      const result = await response.json();
      setProject(result.data);
    } catch (err) {
      setError("Failed to load project details.");
      console.error("Error loading project:", err);
    }
  };

  // Load project chats
  const loadProjectChats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/chats`
      );

      if (!response.ok) {
        throw new Error("Failed to load project chats");
      }

      const result = await response.json();
      console.log(result, "result");
      setProjectChats(result.data);
    } catch (err) {
      setError("Failed to load project chats.");
      console.error("Error loading project chats:", err);
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
        await Promise.all([loadProject(), loadProjectChats()]);
        setLoading(false);
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

  return (
    <ProjectView
      project={project}
      projectChats={projectChats}
      error={error}
      isCreatingChat={isCreatingChat}
      onCreateNewChat={createNewChat}
      onChatClick={handleChatClick}
    />
  );
}
