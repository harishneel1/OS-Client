"use client";

import {
  X,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface ProjectDocument {
  id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  processing_status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProjectDocument | null;
}

// Pipeline Steps Configuration - maps to backend status values
const PIPELINE_STEPS = [
  {
    id: "uploading",
    name: "Upload to S3",
    description: "Uploading file to secure cloud storage",
  },
  {
    id: "queued",
    name: "Queued",
    description: "File queued for processing",
  },
  {
    id: "analysis",
    name: "Document Analysis",
    description: "Analyzing document structure and metadata",
  },
  {
    id: "partitioning",
    name: "Partitioning",
    description: "Processing and extracting text, images, and tables",
  },
  {
    id: "enrichment",
    name: "AI Enrichment",
    description: "Enhancing images and tables with AI descriptions",
  },
  {
    id: "chunking",
    name: "Text Chunking",
    description: "Creating semantic text chunks",
  },
  {
    id: "embedding",
    name: "Embedding Generation",
    description: "Generating vector embeddings",
  },
  {
    id: "storage",
    name: "Vector Storage",
    description: "Storing vectors in database",
  },
  {
    id: "indexing",
    name: "Index Building",
    description: "Building search indexes",
  },
  {
    id: "completed",
    name: "Completed",
    description: "Document processing completed successfully",
  },
];

export function FileDetailsModal({
  isOpen,
  onClose,
  document,
}: FileDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<string>("uploading");
  const [chunksFilter, setChunksFilter] = useState<
    "all" | "text" | "image" | "table"
  >("all");
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChunk, setSelectedChunk] = useState<any>(null);

  const [chunks, setChunks] = useState<any[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);

  // Get current processing status from document prop
  const currentStatus = document?.processing_status || "uploading";
  const progressPercentage = document?.progress_percentage || 0;
  const isProcessingComplete = currentStatus === "completed";
  const isProcessingFailed = currentStatus === "failed";

  // Debug logging - remove this later
  console.log("Modal Debug:", {
    currentStatus,
    progressPercentage,
    activeTab,
    documentId: document?.id,
  });

  // Load chunks when document processing is complete
  const loadChunks = async () => {
    if (!document?.project_id || !document?.id || !user?.id) return;

    try {
      setChunksLoading(true);

      const response = await fetch(
        `http://localhost:8000/api/projects/${document.project_id}/files/${document.id}/chunks?clerk_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load chunks");
      }

      const result = await response.json();

      const transformedChunks = result.data.map((chunk: any) => ({
        id: chunk.id,
        type: chunk.type,
        content: chunk.content,
        page: chunk.page_number,
        chunkIndex: chunk.chunk_index,
        chars: chunk.char_count,
      }));

      setChunks(transformedChunks);
      console.log(
        `Loaded ${transformedChunks.length} real chunks from database`
      );
    } catch (error) {
      console.error("Error loading chunks:", error);
      setChunks([]);
    } finally {
      setChunksLoading(false);
    }
  };

  // Load chunks when modal opens and processing is complete
  useEffect(() => {
    if (isOpen && isProcessingComplete) {
      loadChunks();
    }
  }, [isOpen, isProcessingComplete, document?.id]);

  // Reset state when modal opens with new document
  useEffect(() => {
    if (isOpen && document) {
      // Set active tab based on current processing status
      setActiveTab(currentStatus);
      setSelectedChunk(null);
      setSearchQuery("");
      setChunks([]);
    }
  }, [isOpen, document?.id, currentStatus]);

  // Auto-update active tab when processing status changes
  useEffect(() => {
    if (isOpen && currentStatus && currentStatus !== "completed") {
      setActiveTab(currentStatus);
    }
  }, [currentStatus, isOpen]);

  const getStepStatus = (stepId: string) => {
    const stepIndex = PIPELINE_STEPS.findIndex((step) => step.id === stepId);
    const currentIndex = PIPELINE_STEPS.findIndex(
      (step) => step.id === currentStatus
    );

    if (isProcessingFailed) {
      // If processing failed, show steps up to current as completed, current as failed, rest as pending
      if (stepIndex < currentIndex) return "completed";
      if (stepIndex === currentIndex) return "failed";
      return "pending";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "processing";
    return "pending";
  };

  const isTabEnabled = (stepId: string) => {
    if (stepId === "completed" && isProcessingComplete) return true;

    // Allow clicking on any completed or current step
    const stepStatus = getStepStatus(stepId);
    return stepStatus === "processing" || stepStatus === "completed";
  };

  const getTabIcon = (stepId: string) => {
    const status = getStepStatus(stepId);

    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredChunks = chunks.filter((chunk) => {
    const matchesFilter = chunksFilter === "all" || chunk.type === chunksFilter;
    const matchesSearch = chunk.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderTabContent = () => {
    if (activeTab === "completed" && isProcessingComplete) {
      return (
        <div className="h-full flex flex-col">
          {/* Chunks Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Content Chunks
              </h3>
              <div className="text-sm text-gray-500">
                {filteredChunks.length} of {chunks.length} chunks
                {chunksLoading && (
                  <span className="text-blue-500"> (Loading...)</span>
                )}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex gap-4">
              <div className="flex gap-2">
                {["all", "text", "image", "table"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setChunksFilter(filter as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      chunksFilter === filter
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search chunks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Chunks List */}
          <div className="flex-1 overflow-y-auto p-6">
            {chunksLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">Loading chunks...</span>
              </div>
            ) : filteredChunks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No chunks found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    onClick={() => setSelectedChunk(chunk)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedChunk?.id === chunk.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            chunk.type === "text"
                              ? "bg-green-100 text-green-700"
                              : chunk.type === "image"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {chunk.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Page {chunk.page}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {chunk.type === "text" && `${chunk.chars} chars`}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Regular step content
    const currentStep = PIPELINE_STEPS.find((s) => s.id === activeTab);
    if (!currentStep) return null;

    const stepStatus = getStepStatus(activeTab);

    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            {getTabIcon(activeTab)}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentStep.name}
          </h3>

          <p className="text-gray-600 mb-6">{currentStep.description}</p>

          {stepStatus === "processing" && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(progressPercentage, 10)}%` }}
              />
            </div>
          )}

          {stepStatus === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">
                ✓ Step completed successfully
              </p>
            </div>
          )}

          {stepStatus === "failed" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">
                ✗ Processing failed at this step
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {document.original_filename}
              </h2>
              <p className="text-sm text-gray-500">
                {formatFileSize(document.file_size)} • Processing Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pipeline Tabs */}
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex space-x-0 overflow-x-auto">
            {PIPELINE_STEPS.filter((step) => step.id !== "completed").map(
              (step) => {
                const status = getStepStatus(step.id);
                const enabled = isTabEnabled(step.id);

                return (
                  <button
                    key={step.id}
                    onClick={() => enabled && setActiveTab(step.id)}
                    disabled={!enabled}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                      activeTab === step.id
                        ? "border-blue-500 text-blue-600"
                        : enabled
                        ? "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
                        : "border-transparent text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span
                      className={`${
                        status === "completed"
                          ? "text-green-500"
                          : status === "processing"
                          ? "text-blue-500"
                          : status === "failed"
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {getTabIcon(step.id)}
                    </span>
                    {step.name}
                  </button>
                );
              }
            )}

            {/* View Chunks Tab */}
            <button
              onClick={() => isProcessingComplete && setActiveTab("completed")}
              disabled={!isProcessingComplete}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === "completed"
                  ? "border-purple-500 text-purple-600"
                  : isProcessingComplete
                  ? "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
                  : "border-transparent text-gray-400 cursor-not-allowed"
              }`}
            >
              <Eye
                className={`w-4 h-4 ${
                  isProcessingComplete ? "text-purple-500" : "text-gray-400"
                }`}
              />
              View Chunks
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>

          {/* Right Panel - Detail Inspector */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Detail Inspector</h4>
            </div>

            {selectedChunk ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        selectedChunk.type === "text"
                          ? "bg-green-100 text-green-700"
                          : selectedChunk.type === "image"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {selectedChunk.type.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Content
                    </h5>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                      {selectedChunk.content}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Metadata
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Page:</span>
                        <span className="font-medium">
                          {selectedChunk.page}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Characters:</span>
                        <span className="font-medium">
                          {selectedChunk.chars}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chunk Index:</span>
                        <span className="font-medium">
                          {selectedChunk.chunkIndex}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Eye size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm">
                    {isProcessingComplete
                      ? "Select a chunk to inspect details"
                      : "Chunks will be available when processing completes"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
