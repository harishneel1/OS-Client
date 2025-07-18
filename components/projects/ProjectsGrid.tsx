"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "./CreateProjectModal";
import { Project } from "@/lib/types";

interface ProjectsGridProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onCreateProject: (name: string, description: string) => Promise<Project>;
}

export function ProjectsGrid({
  projects,
  loading,
  error,
  onCreateProject,
}: ProjectsGridProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      setIsCreating(true);
      const newProject = await onCreateProject(name, description);
      setShowCreateModal(false);
      router.push(`/projects/${newProject.id}`);
    } catch (err) {
      // Error is handled by parent component
      console.error("Failed to create project:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            New project
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4">
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            {searchQuery ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first project to get started
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer p-4"
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-base truncate mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
        isLoading={isCreating}
      />
    </div>
  );
}
