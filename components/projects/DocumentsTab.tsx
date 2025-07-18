"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2 } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

export function DocumentsTab() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    // Demo files for now
    {
      id: "1",
      name: "research-paper.pdf",
      size: 2400000, // 2.3 MB
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "application/pdf",
    },
    {
      id: "2",
      name: "project-notes.md",
      size: 159744, // 156 KB
      uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      type: "text/markdown",
    },
    {
      id: "3",
      name: "documentation.docx",
      size: 3870720, // 3.7 MB
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ]);
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);

    // Simulate upload process
    for (const file of acceptedFiles) {
      // In real implementation, this would upload to S3
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        type: file.type,
      };

      setUploadedFiles((prev) => [newFile, ...prev]);
    }

    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date) => {
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
          Uploaded Documents ({uploadedFiles.length})
        </h3>

        {uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No documents uploaded yet
          </div>
        ) : (
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Uploaded{" "}
                      {formatTimeAgo(file.uploadedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFile(file.id)}
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
