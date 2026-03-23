"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import FileUpload from "@/components/FileUpload";
import MetadataBadge from "@/components/MetadataBadge";
import ContactEditor from "@/components/ContactEditor";
import SectionEditor from "@/components/SectionEditor";
import {
  ResumeData,
  ResumeSectionItem,
  sections,
  flatMetadataToResumeData,
  createEmptyResumeData,
  resumeDataToFlatMetadata,
} from "@/lib/rms-schema";
import {
  readRmsMetadata,
  writeRmsMetadata,
} from "@/lib/pdf-client";

// Lazy-load PdfPreview since it relies on canvas/DOM APIs
const PdfPreview = dynamic(() => import("@/components/PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type Tab =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "certification"
  | "coursework"
  | "involvement"
  | "project"
  | "skill"
  | "publication"
  | "award"
  | "reference";

const tabs: { id: Tab; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skill", label: "Skills" },
  { id: "project", label: "Projects" },
  { id: "certification", label: "Certifications" },
  { id: "involvement", label: "Involvement" },
  { id: "coursework", label: "Coursework" },
  { id: "publication", label: "Publications" },
  { id: "award", label: "Awards" },
  { id: "reference", label: "References" },
];

export default function Home() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("contact");
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // ─── Upload Handler (100% client-side) ───────────────────────────────────

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setError(null);
    setSaveSuccess(false);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Try to read existing RMS metadata; otherwise start empty
      const existingMeta = readRmsMetadata(bytes);
      const data: ResumeData = existingMeta
        ? flatMetadataToResumeData(existingMeta)
        : createEmptyResumeData();

      setPdfBytes(bytes);
      setResumeData(data);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setActiveTab("contact");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // ─── JSON Export ─────────────────────────────────────────────────────────

  const handleExportJson = useCallback(() => {
    if (!resumeData) return;
    const json = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.pdf$/i, "") || "resume") + "_metadata.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [resumeData, fileName]);

  // ─── JSON Import ─────────────────────────────────────────────────────────

  const handleImportJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as ResumeData;
        setResumeData(parsed);
        setError(null);
      } catch {
        setError("Invalid JSON file — could not import metadata.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  }, [resumeData]);

  // ─── Save Handler (100% client-side) ─────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!pdfBytes || !resumeData) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const flatMeta = resumeDataToFlatMetadata(resumeData);
      const newPdfBytes = await writeRmsMetadata(pdfBytes, flatMeta);

      // Download the file
      const blob = new Blob([newPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(/\.pdf$/i, "") + "_rms.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [pdfBytes, resumeData, fileName]);

  // ─── Data Update Helpers ─────────────────────────────────────────────────

  const updateContact = useCallback(
    (contact: Record<string, string>) => {
      if (!resumeData) return;
      setResumeData({ ...resumeData, contact });
    },
    [resumeData]
  );

  const updateSummary = useCallback(
    (summary: string) => {
      if (!resumeData) return;
      setResumeData({ ...resumeData, summary });
    },
    [resumeData]
  );

  const updateSection = useCallback(
    (sectionName: string, items: ResumeSectionItem[]) => {
      if (!resumeData) return;
      setResumeData({ ...resumeData, [sectionName]: items });
    },
    [resumeData]
  );

  const handleReset = useCallback(() => {
    setPdfBytes(null);
    setResumeData(null);
    setFileName("");
    setFileSize(0);
    setError(null);
    setSaveSuccess(false);
    setActiveTab("contact");
  }, []);

  // ─── Section item counts (for badges) ────────────────────────────────────

  const getItemCount = (sectionName: string): number => {
    if (!resumeData) return 0;
    const items = resumeData[sectionName];
    return Array.isArray(items) ? items.length : 0;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Resume Metadata Editor
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <a
                  href="https://github.com/rezi-io/resume-standard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors"
                >
                  Resume Metadata Standard v2
                </a>
              </p>
            </div>
          </div>

          {resumeData && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Upload New
              </button>
              {/* JSON Import */}
              <label className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
                Import JSON
                <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
              </label>
              {/* JSON Export */}
              <button
                onClick={handleExportJson}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Export JSON
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-60"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save & Download"
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success banner */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 dark:text-green-300 text-sm">
              PDF saved with Resume Metadata Standard! Your download should start automatically.
            </p>
          </div>
        )}

        {/* Upload area (shown when no file loaded) */}
        {!resumeData && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Read & Edit Resume Metadata
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Upload a PDF resume to view, edit, or add{" "}
                <a
                  href="https://github.com/rezi-io/resume-standard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Resume Metadata Standard
                </a>{" "}
                (RMS) metadata. If no metadata is found, we&apos;ll try to
                pre-fill fields from the PDF text.
              </p>
            </div>
            <FileUpload
              onFileSelected={handleFileSelected}
              isLoading={isProcessing}
            />

            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Read Metadata
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Instantly detect and display existing RMS metadata in any PDF resume.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Edit & Add
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Edit existing metadata or add new structured data to any resume PDF.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Auto-Fill
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Smart text parsing attempts to pre-fill fields from PDF content automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Editor area (shown when a file is loaded) */}
        {resumeData && (
          <div className="space-y-6">
            {/* File info & metadata status + preview toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <MetadataBadge
                  hasMetadata={resumeData.hasMetadata}
                  fileName={fileName}
                  fileSize={fileSize}
                />
              </div>
              {pdfBytes && (
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all shrink-0 ${
                    showPreview
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              )}
            </div>

            {/* Two-column: Editor (left, fixed) + Preview (right, fills rest) */}
            <div className={`flex gap-6 ${showPreview && pdfBytes ? "flex-col lg:flex-row" : ""}`}>
              {/* Editor panel — fixed width on desktop */}
              <div className="lg:w-[480px] lg:shrink-0 min-w-0 space-y-4">
                {/* Tab navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <nav className="flex gap-1 min-w-max" role="tablist">
                    {tabs.map((tab) => {
                      const count =
                        tab.id !== "contact" &&
                        tab.id !== "summary"
                          ? getItemCount(tab.id)
                          : null;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600 dark:text-blue-400"
                              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                          }`}
                        >
                          {tab.label}
                          {count !== null && count > 0 && (
                            <span className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab content */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  {/* Contact */}
                  {activeTab === "contact" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Contact Information
                      </h3>
                      <ContactEditor
                        contact={resumeData.contact}
                        onChange={updateContact}
                      />
                    </div>
                  )}

                  {/* Summary */}
                  {activeTab === "summary" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Professional Summary
                      </h3>
                      <textarea
                        value={resumeData.summary || ""}
                        onChange={(e) => updateSummary(e.target.value)}
                        placeholder="Software Engineer with 5+ years of experience..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-y"
                      />
                    </div>
                  )}

                  {/* Indexed sections */}
                  {sections.map(
                    (section) =>
                      activeTab === section.name && (
                        <div key={section.name}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {section.label}
                          </h3>
                          <SectionEditor
                            section={section}
                            items={
                              (resumeData[section.name] as ResumeSectionItem[]) || []
                            }
                            onChange={(items) =>
                              updateSection(section.name, items)
                            }
                          />
                        </div>
                      )
                  )}

                </div>

                {/* Bottom save button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Upload Different PDF
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Metadata & Download PDF"}
                  </button>
                </div>
              </div>

              {/* PDF Preview panel — fills all remaining width */}
              {showPreview && pdfBytes && (
                <div className="flex-1 min-w-0 h-[600px] lg:h-[calc(100vh-220px)] lg:sticky lg:top-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
                  <PdfPreview pdfBytes={pdfBytes} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>
            Open-source tool for the{" "}
            <a
              href="https://github.com/rezi-io/resume-standard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Resume Metadata Standard
            </a>
            . Your PDF is processed entirely in your browser — nothing is uploaded to a server.
          </p>
        </div>
      </footer>
    </div>
  );
}
