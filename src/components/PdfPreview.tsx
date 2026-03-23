"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { renderPdfPage, getPdfPageCount, getPdfPageSize } from "@/lib/pdf-client";
import type { PageViewport } from "pdfjs-dist";
import type { TextContent } from "pdfjs-dist/types/src/display/api";

interface PdfPreviewProps {
  pdfBytes: Uint8Array;
}

export default function PdfPreview({ pdfBytes }: PdfPreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);    // scrollable wrapper — used to measure fit width
  const containerRef = useRef<HTMLDivElement>(null); // holds canvas + text layer
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState<number | null>(null); // null = waiting for fit calculation

  // ── On mount: get page count + natural page size → compute fit scale ──────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [count, size] = await Promise.all([
        getPdfPageCount(pdfBytes),
        getPdfPageSize(pdfBytes, 1),
      ]);
      if (cancelled) return;
      setTotalPages(count);
      setCurrentPage(1);

      // Fit to the scrollable container width (minus padding)
      const containerWidth = scrollRef.current?.clientWidth ?? 400;
      const padding = 32; // 2 × p-4
      const fitScale = Math.max(0.25, (containerWidth - padding) / size.width);
      setScale(Math.round(fitScale * 100) / 100);
    })();
    return () => { cancelled = true; };
  }, [pdfBytes]);

  // ── Render page whenever page number or scale changes ─────────────────────
  useEffect(() => {
    if (totalPages === 0 || scale === null) return;
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);

    renderPdfPage(pdfBytes, currentPage, scale).then(
      ({ canvas, width, height, textContent, viewport }) => {
        if (cancelled) return;

        // Clear previous content
        while (container.firstChild) container.removeChild(container.firstChild);

        // Wrapper — positions canvas and text layer on top of each other
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;

        canvas.style.display = "block";
        canvas.style.borderRadius = "4px";
        canvas.style.pointerEvents = "none"; // let text layer handle mouse events
        wrapper.appendChild(canvas);

        // Build selectable text layer
        const textLayer = buildTextLayer(textContent, viewport, width, height);
        wrapper.appendChild(textLayer);

        container.appendChild(wrapper);
        setLoading(false);
      }
    ).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [pdfBytes, currentPage, scale, totalPages]);

  const prevPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const nextPage = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
  const zoomOut = useCallback(() =>
    setScale((s) => s === null ? null : Math.max(0.25, Math.round((s - 0.25) * 100) / 100)), []);
  const zoomIn = useCallback(() =>
    setScale((s) => s === null ? null : Math.min(4, Math.round((s + 0.25) * 100) / 100)), []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={prevPage} disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors" title="Previous page">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-14 text-center tabular-nums">
            {currentPage} / {totalPages || "–"}
          </span>
          <button onClick={nextPage} disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors" title="Next page">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Zoom out">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center tabular-nums">
            {scale !== null ? `${Math.round(scale * 100)}%` : "…"}
          </span>
          <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Zoom in">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable canvas area */}
      <div ref={scrollRef} className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 rounded-b-xl flex items-start justify-center p-4 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={containerRef} className={`${loading ? "invisible" : ""} shadow-lg`} />
      </div>
    </div>
  );
}

// ── Text layer builder ───────────────────────────────────────────────────────
// Positions transparent <span>s over the canvas that exactly match rendered
// text positions, making content selectable and copyable.

function buildTextLayer(
  textContent: TextContent,
  viewport: PageViewport,
  width: number,
  height: number
): HTMLDivElement {
  const layer = document.createElement("div");
  layer.style.position = "absolute";
  layer.style.top = "0";
  layer.style.left = "0";
  layer.style.width = `${width}px`;
  layer.style.height = `${height}px`;
  layer.style.overflow = "hidden";
  layer.style.lineHeight = "1";
  layer.style.pointerEvents = "none"; // layer itself is transparent to clicks; spans opt-in below

  const vScale = viewport.scale;
  const [vpSx, , , vpSy, vpTx, vpTy] = viewport.transform;

  for (const rawItem of textContent.items) {
    const item = rawItem as {
      str: string;
      transform: number[];
      width: number;
      height: number;
      fontName?: string;
    };
    if (!item.str.trim()) continue;

    const [a, b, , d, e, f] = item.transform;

    // Map PDF user-space coords to canvas pixel coords using the viewport transform.
    // viewport.transform = [scaleX, 0, 0, -scaleY, offsetX, offsetY] for normal pages.
    const x = e * vpSx + vpTx;
    // PDF y goes bottom-up; canvas goes top-down. vpSy is negative.
    const y = f * vpSy + vpTy;

    const fontSize = Math.abs(d * vpSy);

    const span = document.createElement("span");
    span.textContent = item.str;
    span.style.position = "absolute";
    span.style.left = `${x}px`;
    span.style.top = `${y - fontSize}px`;
    span.style.fontSize = `${Math.max(1, fontSize)}px`;
    span.style.fontFamily = item.fontName ?? "sans-serif";
    span.style.color = "transparent";
    span.style.whiteSpace = "pre";
    span.style.cursor = "text";
    span.style.userSelect = "text";
    span.style.pointerEvents = "auto";
    span.style.transformOrigin = "left bottom";

    // Rotation from the PDF glyph transform
    const angle = Math.atan2(b, a);
    // Scale span horizontally to cover the actual rendered glyph width
    const renderedWidth = Math.abs(item.width * vpSx);
    const naturalWidth = item.str.length * fontSize * 0.55; // rough monospace estimate
    const scaleX = naturalWidth > 0 ? renderedWidth / naturalWidth : 1;
    span.style.transform = `rotate(${-angle}rad) scaleX(${Math.max(0.1, Math.min(5, scaleX))})`;

    layer.appendChild(span);
  }

  return layer;
}
