"use client";

import React, { useCallback, useState } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelected, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          onFileSelected(file);
        }
      }
    },
    [onFileSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileSelected(e.target.files[0]);
      }
    },
    [onFileSelected]
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
        ${dragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }
        ${isLoading ? "opacity-60 pointer-events-none" : ""}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById("pdf-input")?.click()}
    >
      <input
        id="pdf-input"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Processing PDF...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Drop your resume PDF here
            </p>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              or <span className="text-blue-500 underline">click to browse</span>
            </p>
          </div>
          <p className="text-sm text-gray-400">PDF files only, up to 25 MB</p>
        </div>
      )}
    </div>
  );
}
