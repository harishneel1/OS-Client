"use client";

import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ProjectView } from "../../../../components/projects/ProjectView";
import { Project, Chat, ProjectSettings, ProjectDocument } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { FileDetailsModal } from "@/components/projects/FileDetailsModal";

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

  const [selectedDocument, setSelectedDocument] =
    useState<ProjectDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    const result = await apiClient.get(
      `/api/projects/${projectId}?clerk_id=${user.id}`
    );

    setProject(result.data);
  };

  // Load project chats
  const loadProjectChats = async () => {
    const result = await apiClient.get(`/api/projects/${projectId}/chats`);
    setProjectChats(result.data);
  };

  const handleViewDetails = (fileId: string) => {
    const document = projectDocuments.find((doc) => doc.id === fileId);
    if (document) {
      setSelectedDocument(document);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  // Load project settings
  const loadProjectSettings = async () => {
    if (!user?.id) return;

    const result = await apiClient.get(
      `/api/projects/${projectId}/settings?clerk_id=${user.id}`
    );

    setProjectSettings(result.data);
  };

  // Load project documents
  const loadProjectDocuments = async () => {
    if (!user?.id) return;

    const result = await apiClient.get(
      `/api/projects/${projectId}/files?clerk_id=${user.id}`
    );

    setProjectDocuments(result.data);
  };

  // Handle file upload with proper error handling
  const handleFileUpload = async (files: File[]) => {
    if (!user?.id) return;

    // Step 1: Create ALL temp documents and show them immediately
    const tempDocuments = files.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`, // index prevents collisions
      project_id: projectId,
      original_filename: file.name,
      s3_key: "",
      file_size: file.size,
      file_type: file.type,
      processing_status: "uploading" as const,
      clerk_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Step 2: Add ALL files to UI at once
    setProjectDocuments((prev) => [...tempDocuments, ...prev]);

    // Step 3: Upload all files in parallel, update each individually
    const uploadPromises = tempDocuments.map(async (tempDoc, index) => {
      const file = files[index]; // direct mapping by index
      let documentId: string | null = null;

      try {
        // Get presigned URL (creates database record)
        const uploadData = await apiClient.post(
          `/api/projects/${projectId}/files/upload-url?clerk_id=${user.id}`,
          {
            filename: file.name,
            file_size: file.size,
            file_type: file.type,
          }
        );

        const { upload_url, s3_key, document_id } = uploadData.data;
        documentId = document_id;

        // Upload file directly to S3
        await apiClient.uploadToS3(upload_url, file);

        // Confirm upload
        const confirmData = await apiClient.post(
          `/api/projects/${projectId}/files/confirm?clerk_id=${user.id}`,
          { s3_key }
        );

        setProjectDocuments((prev) =>
          prev.map((doc) =>
            doc.id === tempDoc.id
              ? { ...confirmData.data, processing_status: "queued" }
              : doc
          )
        );
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setError(`Failed to upload ${file.name}`);

        // Update this specific tempDoc to 'failed'
        setProjectDocuments((prev) =>
          prev.map((doc) =>
            doc.id === tempDoc.id
              ? { ...doc, processing_status: "failed" }
              : doc
          )
        );

        // Cleanup orphaned database record if it was created
        if (documentId) {
          try {
            await fetch(
              `${API_BASE_URL}/api/projects/${projectId}/files/${documentId}?clerk_id=${user.id}`,
              { method: "DELETE" }
            );
            console.log(`Cleaned up orphaned record: ${documentId}`);
          } catch (cleanupError) {
            console.error("Failed to cleanup orphaned record:", cleanupError);
          }
        }
      }
    });

    await Promise.allSettled(uploadPromises);
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string) => {
    if (!user?.id) return;

    try {
      const response = await apiClient.delete(
        `/api/projects/${projectId}/files/${fileId}?clerk_id=${user.id}`
      );

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

      const result = await apiClient.put(
        `/api/projects/${projectId}/settings?clerk_id=${user.id}`,
        settings
      );

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

      const result = await apiClient.post("/api/chats", {
        title: "New Chat",
        project_id: projectId,
        clerk_id: user.id,
      });

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
    <>
      <ProjectView
        project={project}
        projectChats={projectChats}
        projectSettings={projectSettings}
        projectDocuments={projectDocuments}
        error={error}
        settingsError={settingsError}
        settingsLoading={settingsLoading}
        isCreatingChat={isCreatingChat}
        onCreateNewChat={createNewChat}
        onChatClick={handleChatClick}
        onSaveSettings={saveProjectSettings}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        onViewDetails={handleViewDetails}
      />
      <FileDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        document={selectedDocument}
      />
    </>
  );
}
