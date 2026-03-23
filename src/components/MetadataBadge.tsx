"use client";

interface MetadataBadgeProps {
  hasMetadata: boolean;
  fileName: string;
  fileSize: number;
}

export default function MetadataBadge({
  hasMetadata,
  fileName,
  fileSize,
}: MetadataBadgeProps) {
  const sizeFormatted =
    fileSize > 1024 * 1024
      ? `${(fileSize / 1024 / 1024).toFixed(1)} MB`
      : `${(fileSize / 1024).toFixed(0)} KB`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {/* PDF icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate max-w-xs">
            {fileName}
          </p>
          <p className="text-xs text-gray-400">{sizeFormatted}</p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          hasMetadata
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            hasMetadata ? "bg-green-500" : "bg-amber-500"
          }`}
        />
        {hasMetadata ? "RMS Metadata Found" : "No Metadata – Ready to Add"}
      </div>
    </div>
  );
}
