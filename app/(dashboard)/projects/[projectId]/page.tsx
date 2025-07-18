"use client";

import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ProjectView } from "../../../../components/projects/ProjectView";
import { Project, Chat, ProjectSettings, ProjectDocument } from "@/lib/types";

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
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  // Load project documents
  const loadProjectDocuments = async () => {
    if (!user?.id) return;

    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/files?clerk_id=${user.id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load project documents");
    }

    const result = await response.json();
    setProjectDocuments(result.data);
  };

  // Handle file upload with proper error handling
  const handleFileUpload = async (files: File[]) => {
    if (!user?.id) return;

    setUploading(true);

    for (const file of files) {
      let documentId: string | null = null;

      try {
        // Step 1: Get presigned URL (creates database record)
        const uploadResponse = await fetch(
          `${API_BASE_URL}/api/projects/${projectId}/files/upload-url?clerk_id=${user.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              file_size: file.size,
              file_type: file.type,
            }),
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to get upload URL");
        }

        const uploadData = await uploadResponse.json();
        const { upload_url, s3_key, document_id } = uploadData.data;

        // Store document_id for cleanup if needed
        documentId = document_id;

        // Step 2: Upload file directly to S3
        const s3Response = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!s3Response.ok) {
          throw new Error("Failed to upload to S3");
        }

        // Step 3: Confirm upload success
        const confirmResponse = await fetch(
          `${API_BASE_URL}/api/projects/${projectId}/files/confirm?clerk_id=${user.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ s3_key }),
          }
        );

        if (!confirmResponse.ok) {
          throw new Error("Failed to confirm upload");
        }

        const confirmData = await confirmResponse.json();

        // ✅ SUCCESS: Add to state
        setProjectDocuments((prev) => [confirmData.data, ...prev]);
      } catch (error) {
        console.error("Upload failed:", error);
        setError(`Failed to upload ${file.name}`);

        if (documentId) {
          try {
            await fetch(
              `${API_BASE_URL}/api/projects/${projectId}/files/${documentId}?clerk_id=${user.id}`,
              {
                method: "DELETE",
              }
            );
            console.log(`Cleaned up orphaned record: ${documentId}`);
          } catch (cleanupError) {
            console.error("Failed to cleanup orphaned record:", cleanupError);
            // Don't throw - this is just cleanup
          }
        }
      }
    }

    setUploading(false);
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/files/${fileId}?clerk_id=${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setProjectDocuments((prev) => prev.filter((doc) => doc.id !== fileId));
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Failed to delete file");
    }
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
            loadProjectDocuments(),
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

  return (
    <ProjectView
      project={project}
      projectChats={projectChats}
      projectSettings={projectSettings}
      projectDocuments={projectDocuments}
      error={error}
      settingsError={settingsError}
      settingsLoading={settingsLoading}
      isCreatingChat={isCreatingChat}
      uploading={uploading}
      onCreateNewChat={createNewChat}
      onChatClick={handleChatClick}
      onSaveSettings={saveProjectSettings}
      onFileUpload={handleFileUpload}
      onFileDelete={handleFileDelete}
    />
  );
}
