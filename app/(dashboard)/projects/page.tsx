"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ProjectsGrid } from "../../../components/projects/ProjectsGrid";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

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

      const response = await fetch(
        `${API_BASE_URL}/api/projects?clerk_id=${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const projectsData = await response.json();
      const { data } = projectsData || {};
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

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          clerk_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      const savedProject = data?.data || {};
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
