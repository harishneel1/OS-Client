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

interface ProjectDocument {
  id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  processing_status: string;
  created_at: string;
  updated_at: string;
}

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProjectDocument | null;
}

// Pipeline Steps Configuration
const PIPELINE_STEPS = [
  {
    id: "upload",
    name: "Upload to S3",
    duration: 2,
    description: "Uploading file to secure cloud storage",
  },
  {
    id: "queue",
    name: "Queued",
    duration: 0.5,
    description: "File queued for processing",
  },
  {
    id: "analysis",
    name: "Document Analysis",
    duration: 6,
    description: "Analyzing document structure and metadata",
  },
  {
    id: "partitioning",
    name: "Partitioning",
    duration: 15,
    description: "Processing and extracting text, images, and tables",
  },
  {
    id: "enrichment",
    name: "AI Enrichment",
    duration: 18,
    description: "Enhancing images and tables with AI descriptions",
  },
  {
    id: "chunking",
    name: "Text Chunking",
    duration: 6,
    description: "Creating semantic text chunks",
  },
  {
    id: "embedding",
    name: "Embedding Generation",
    duration: 25,
    description: "Generating vector embeddings",
  },
  {
    id: "storage",
    name: "Vector Storage",
    duration: 4,
    description: "Storing vectors in database",
  },
  {
    id: "indexing",
    name: "Index Building",
    duration: 8,
    description: "Building search indexes",
  },
];

// Mock chunk data
const MOCK_CHUNKS = [
  {
    id: "chunk-1",
    type: "text",
    content:
      "Introduction to Machine Learning: Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data...",
    page: 1,
    tokens: 124,
    chars: 156,
  },
  {
    id: "chunk-2",
    type: "text",
    content:
      "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes called neurons...",
    page: 2,
    tokens: 98,
    chars: 132,
  },
  {
    id: "chunk-3",
    type: "image",
    content:
      "Neural Network Architecture Diagram - Shows input layer, hidden layers, and output layer with connections between neurons",
    page: 3,
    tokens: 0,
    chars: 0,
  },
  {
    id: "chunk-4",
    type: "table",
    content:
      "Performance Comparison Table - Model accuracy across different datasets: CNN: 94.2%, RNN: 87.5%, Transformer: 96.8%",
    page: 4,
    tokens: 0,
    chars: 0,
  },
  {
    id: "chunk-5",
    type: "text",
    content:
      "Deep learning has revolutionized computer vision, natural language processing, and many other domains through its ability to learn hierarchical representations...",
    page: 5,
    tokens: 145,
    chars: 178,
  },
];

type StepStatus = "pending" | "processing" | "completed" | "failed";

interface PipelineStep {
  id: string;
  name: string;
  status: StepStatus;
  duration: number;
  description: string;
  startTime?: number;
  completedTime?: number;
}

export function FileDetailsModal({
  isOpen,
  onClose,
  document,
}: FileDetailsModalProps) {
  const [steps, setSteps] = useState<PipelineStep[]>(() =>
    PIPELINE_STEPS.map((step) => ({ ...step, status: "pending" as StepStatus }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [chunksFilter, setChunksFilter] = useState<
    "all" | "text" | "image" | "table"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [processingComplete, setProcessingComplete] = useState(false);

  const [metrics, setMetrics] = useState({
    pagesProcessed: 0,
    totalPages: 15,
    chunksCreated: 0,
    imagesFound: 0,
    tablesExtracted: 0,
    processingTime: 0,
  });

  // Simulation effect
  useEffect(() => {
    if (!isOpen || !document) return;

    // Reset state when modal opens
    setSteps(
      PIPELINE_STEPS.map((step) => ({
        ...step,
        status: "pending" as StepStatus,
      }))
    );
    setCurrentStepIndex(0);
    setActiveTab("upload");
    setProcessingComplete(false);
    setMetrics({
      pagesProcessed: 0,
      totalPages: 15,
      chunksCreated: 0,
      imagesFound: 0,
      tablesExtracted: 0,
      processingTime: 0,
    });

    let timeoutId: NodeJS.Timeout;
    let startTime = Date.now();
    let metricsInterval: NodeJS.Timeout;

    // Start metrics counter
    metricsInterval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        processingTime: Math.floor((Date.now() - startTime) / 1000),
      }));
    }, 1000);

    const processNextStep = (stepIndex: number) => {
      if (stepIndex >= PIPELINE_STEPS.length) {
        setProcessingComplete(true);
        return;
      }

      // Start current step
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === stepIndex
            ? { ...step, status: "processing", startTime: Date.now() }
            : step
        )
      );
      setCurrentStepIndex(stepIndex);
      setActiveTab(PIPELINE_STEPS[stepIndex].id);

      // Simulate step completion
      timeoutId = setTimeout(() => {
        // Complete current step
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === stepIndex
              ? { ...step, status: "completed", completedTime: Date.now() }
              : step
          )
        );

        // Update metrics based on step
        updateMetricsForStep(PIPELINE_STEPS[stepIndex].id);

        // Process next step
        if (stepIndex < PIPELINE_STEPS.length - 1) {
          setTimeout(() => processNextStep(stepIndex + 1), 800);
        } else {
          setProcessingComplete(true);
        }
      }, PIPELINE_STEPS[stepIndex].duration * 1000);
    };

    // Start processing
    processNextStep(0);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(metricsInterval);
    };
  }, [isOpen, document]);

  const updateMetricsForStep = (stepId: string) => {
    setMetrics((prev) => {
      switch (stepId) {
        case "analysis":
          return { ...prev, totalPages: 15 };
        case "partitioning":
          return {
            ...prev,
            pagesProcessed: 15,
            imagesFound: 8,
            tablesExtracted: 3,
          };
        case "chunking":
          return { ...prev, chunksCreated: 47 };
        default:
          return prev;
      }
    });
  };

  const getStepStatus = (stepId: string, index: number) => {
    const step = steps.find((s) => s.id === stepId);
    return step?.status || "pending";
  };

  const isTabEnabled = (stepId: string, index: number) => {
    if (stepId === "chunks") return processingComplete;
    const step = steps.find((s) => s.id === stepId);
    return step?.status === "processing" || step?.status === "completed";
  };

  const getTabIcon = (status: StepStatus) => {
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

  const filteredChunks = MOCK_CHUNKS.filter((chunk) => {
    const matchesFilter = chunksFilter === "all" || chunk.type === chunksFilter;
    const matchesSearch = chunk.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderTabContent = () => {
    if (activeTab === "chunks") {
      return (
        <div className="h-full flex flex-col">
          {/* Chunks Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Content Chunks
              </h3>
              <div className="text-sm text-gray-500">
                {filteredChunks.length} of {MOCK_CHUNKS.length} chunks
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
                      {chunk.type === "text" && `${chunk.tokens} tokens`}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Regular step content
    const currentStep = steps.find((s) => s.id === activeTab);
    if (!currentStep) return null;

    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            {getTabIcon(currentStep.status)}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentStep.name}
          </h3>

          <p className="text-gray-600 mb-6">{currentStep.description}</p>

          {currentStep.status === "processing" && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          )}

          {currentStep.status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">
                ✓ Step completed successfully
              </p>
              {activeTab === "partitioning" && (
                <div className="mt-3 text-sm text-green-600">
                  <div>📄 {metrics.pagesProcessed} pages processed</div>
                  <div>🖼️ {metrics.imagesFound} images found</div>
                  <div>📊 {metrics.tablesExtracted} tables extracted</div>
                </div>
              )}
              {activeTab === "chunking" && (
                <div className="mt-3 text-sm text-green-600">
                  <div>🧩 {metrics.chunksCreated} chunks created</div>
                </div>
              )}
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
            {PIPELINE_STEPS.map((step, index) => {
              const status = getStepStatus(step.id, index);
              const enabled = isTabEnabled(step.id, index);

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
                    {getTabIcon(status)}
                  </span>
                  {step.name}
                </button>
              );
            })}

            {/* View Chunks Tab */}
            <button
              onClick={() => processingComplete && setActiveTab("chunks")}
              disabled={!processingComplete}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === "chunks"
                  ? "border-purple-500 text-purple-600"
                  : processingComplete
                  ? "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
                  : "border-transparent text-gray-400 cursor-not-allowed"
              }`}
            >
              <Eye
                className={`w-4 h-4 ${
                  processingComplete ? "text-purple-500" : "text-gray-400"
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
                      {selectedChunk.type === "text" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tokens:</span>
                            <span className="font-medium">
                              {selectedChunk.tokens}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Characters:</span>
                            <span className="font-medium">
                              {selectedChunk.chars}
                            </span>
                          </div>
                        </>
                      )}
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
                  <p className="text-sm">Select a chunk to inspect details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
