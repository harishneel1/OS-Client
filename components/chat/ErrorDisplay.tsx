"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="text-red-500" size={16} />
        <span className="text-red-700 text-sm">{error}</span>
      </div>
      <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
        <X size={16} />
      </button>
    </div>
  );
}
