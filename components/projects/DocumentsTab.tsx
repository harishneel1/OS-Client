"use client";

import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2 } from "lucide-react";
import { ProjectDocument } from "@/lib/types";

interface DocumentsTabProps {
  projectDocuments: ProjectDocument[];
  uploading: boolean;
  onFileUpload: (files: File[]) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
}

export function DocumentsTab({
  projectDocuments,
  uploading,
  onFileUpload,
  onFileDelete,
}: DocumentsTabProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileUpload,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB limit
    disabled: uploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  // Only show completed uploads
  const completedDocuments = projectDocuments.filter(
    (doc) => doc.upload_status === "completed"
  );

  return (
    <div className="p-4 space-y-4">
      {/* File Upload Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : uploading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto h-8 w-8 mb-2 ${
            uploading ? "text-gray-300" : "text-gray-400"
          }`}
        />

        {uploading ? (
          <div>
            <p className="text-sm text-gray-500">Uploading files...</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-blue-600">Drop files here...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOCX, TXT, MD supported (max 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Uploaded Documents ({completedDocuments.length})
        </h3>

        {completedDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No documents uploaded yet
          </div>
        ) : (
          <div className="space-y-2">
            {completedDocuments
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() -
                  new Date(a.updated_at).getTime()
              )
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText
                      size={16}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.original_filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.file_size)} • Uploaded{" "}
                        {formatTimeAgo(doc.updated_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onFileDelete(doc.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                    title="Delete file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
