import { Upload, FileText } from "lucide-react";

export function DocumentsTab() {
  return (
    <div className="p-4 space-y-4">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOCX, TXT, MD supported
        </p>
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Uploaded Documents
        </h3>
        <div className="space-y-2">
          {/* Document Item 1 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  research-paper.pdf
                </p>
                <p className="text-xs text-gray-500">
                  2.3 MB • Uploaded 2 hours ago
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.02A1.5 1.5 0 0 0 4.551 15h6.898a1.5 1.5 0 0 0 1.498-1.328l.557-10.02a.58.58 0 0 0-.01-1.152H11Z" />
              </svg>
            </button>
          </div>

          {/* Document Item 2 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  project-notes.md
                </p>
                <p className="text-xs text-gray-500">
                  156 KB • Uploaded 1 day ago
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.02A1.5 1.5 0 0 0 4.551 15h6.898a1.5 1.5 0 0 0 1.498-1.328l.557-10.02a.58.58 0 0 0-.01-1.152H11Z" />
              </svg>
            </button>
          </div>

          {/* Document Item 3 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  documentation.docx
                </p>
                <p className="text-xs text-gray-500">
                  3.7 MB • Uploaded 3 days ago
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.02A1.5 1.5 0 0 0 4.551 15h6.898a1.5 1.5 0 0 0 1.498-1.328l.557-10.02a.58.58 0 0 0-.01-1.152H11Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
