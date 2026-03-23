"use client";

import React, { useEffect, useState } from "react";

interface PdfPreviewProps {
  pdfBytes: Uint8Array;
}

export default function PdfPreview({ pdfBytes }: PdfPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Create an object URL from the PDF bytes and revoke it on cleanup / update
  useEffect(() => {
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfBytes]);

  if (!objectUrl) return null;

  return (
    <embed
      src={objectUrl}
      type="application/pdf"
      className="w-full h-full rounded-xl"
    />
  );
}
