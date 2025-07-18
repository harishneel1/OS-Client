"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ProjectsGrid } from "../../../components/projects/ProjectsGrid";
import { Project } from "@/lib/types";
import { apiClient } from "@/lib/api";

const API_BASE_URL = "http://localhost:8000";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const loadProjects = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!user?.id) {
        console.log("No user logged in yet");
        return;
      }

      const result = await apiClient.get(`/api/projects?clerk_id=${user.id}`);

      const { data } = result || {};
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects.");
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description: string) => {
    try {
      setError(null);

      if (!user?.id) {
        setError("User not logged in");
        return;
      }

      const result = await apiClient.post("/api/projects", {
        name,
        description,
        clerk_id: user.id,
      });

      const savedProject = result?.data || {};
      setProjects((prev) => [savedProject, ...prev]);

      return savedProject;
    } catch (err) {
      setError("Failed to create project");
      console.error("Error creating project:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <ProjectsGrid
      projects={projects}
      loading={loading}
      error={error}
      onCreateProject={createProject}
    />
  );
}
