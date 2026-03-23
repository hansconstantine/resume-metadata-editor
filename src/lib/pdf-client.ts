/**
 * Client-side PDF processing — everything runs in the browser.
 *
 * - XMP metadata read/write via pdf-lib (already browser-compatible)
 * - Text extraction via pdfjs-dist (Mozilla PDF.js)
 * - PDF page rendering via pdfjs-dist for preview
 */
import { PDFDocument } from "pdf-lib";

// ─── Lazy-loaded PDF.js (avoids SSR issues with DOMMatrix, etc.) ─────────────

type PdfjsLib = typeof import("pdfjs-dist");
let _pdfjsLib: PdfjsLib | null = null;

async function getPdfjs(): Promise<PdfjsLib> {
  if (_pdfjsLib) return _pdfjsLib;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  _pdfjsLib = lib;
  return lib;
}

// ─── XMP helpers (same logic as the old server-side pdf-utils) ───────────────

function extractXmpXml(pdfBytes: Uint8Array): string | null {
  const text = new TextDecoder("latin1").decode(pdfBytes);

  let start = text.indexOf("<x:xmpmeta");
  if (start === -1) start = text.indexOf("<xmpmeta");
  if (start === -1) return null;

  let end = text.indexOf("</x:xmpmeta>", start);
  if (end === -1) end = text.indexOf("</xmpmeta>", start);
  if (end === -1) return null;

  const endTag = text.indexOf(">", end) + 1;
  return text.substring(start, endTag);
}

function parseRmsFromXmp(xmpXml: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  const descRegex = /<rdf:Description[^>]*>/g;
  let match;
  while ((match = descRegex.exec(xmpXml)) !== null) {
    const tag = match[0];
    const attrRegex = /(\w[\w:]*?)="([^"]*?)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(tag)) !== null) {
      const name = attrMatch[1];
      const value = attrMatch[2];
      if (name.startsWith("xmlns:") || name === "rdf:about") continue;

      let cleanKey = name;
      if (cleanKey.includes(":")) {
        const prefix = cleanKey.split(":")[0];
        const rest = cleanKey.split(":").slice(1).join(":");
        if (prefix === "pdf") cleanKey = rest;
        else if (prefix === "rms") cleanKey = rest;
      }
      metadata[cleanKey] = decodeXmlEntities(value);
    }
  }

  const elementRegex = /<(?:rms|pdf):(\w+)>([^<]+)<\/(?:rms|pdf):\w+>/g;
  while ((match = elementRegex.exec(xmpXml)) !== null) {
    metadata[match[1]] = decodeXmlEntities(match[2].trim());
  }

  return metadata;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "\r");
}

function encodeXmlEntities(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#10;");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Read RMS metadata from raw PDF bytes (client-side).
 */
export function readRmsMetadata(
  pdfBytes: Uint8Array
): Record<string, string> | null {
  const xmpXml = extractXmpXml(pdfBytes);
  if (!xmpXml) return null;

  const metadata = parseRmsFromXmp(xmpXml);

  const producer = metadata["Producer"] || metadata["producer"] || "";
  if (!producer.includes("rms_v")) {
    const hasRmsKeys = Object.keys(metadata).some((k) => k.startsWith("rms_"));
    if (!hasRmsKeys) return null;
  }

  return metadata;
}

/**
 * Write RMS metadata into a PDF, returning new PDF bytes (client-side).
 */
export async function writeRmsMetadata(
  pdfBytes: Uint8Array,
  metadata: Record<string, string>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });

  const xmpPacket = buildXmpPacket(metadata);
  pdfDoc.setProducer(metadata["Producer"] || "rms_v2.0.1");

  const metadataXml = new TextEncoder().encode(xmpPacket);
  const metadataStream = pdfDoc.context.stream(metadataXml, {
    Type: "Metadata",
    Subtype: "XML",
    Length: metadataXml.length,
  });
  const metadataStreamRef = pdfDoc.context.register(metadataStream);
  pdfDoc.catalog.set(
    pdfDoc.context.obj("Metadata" as unknown as number) as never,
    metadataStreamRef
  );

  const savedBytes = await pdfDoc.save();
  return new Uint8Array(savedBytes);
}

function buildXmpPacket(metadata: Record<string, string>): string {
  const producer = metadata["Producer"] || "rms_v2.0.1";
  const rmsAttrs: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (key === "Producer") continue;
    rmsAttrs.push(`rms:${key}="${encodeXmlEntities(value)}"`);
  }

  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
      xmlns:rms="https://github.com/rezi-io/resume-standard"
      pdf:Producer="${encodeXmlEntities(producer)}"
      ${rmsAttrs.join("\n      ")}
    />
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

// ─── PDF Preview (render page to canvas) ─────────────────────────────────────

/**
 * Get the total number of pages in a PDF.
 */
export async function getPdfPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdfjsLib = await getPdfjs();
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice() });
  const doc = await loadingTask.promise;
  return doc.numPages;
}

/**
 * Get the natural (scale=1) dimensions of a PDF page.
 */
export async function getPdfPageSize(
  pdfBytes: Uint8Array,
  pageNumber: number = 1
): Promise<{ width: number; height: number }> {
  const pdfjsLib = await getPdfjs();
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice() });
  const doc = await loadingTask.promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}

/**
 * Render a single page of a PDF to a canvas, and return the text layer items
 * so the caller can build a selectable text overlay.
 */
export async function renderPdfPage(
  pdfBytes: Uint8Array,
  pageNumber: number,
  scale: number = 1.5
): Promise<{
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  textContent: import("pdfjs-dist/types/src/display/api").TextContent;
  viewport: import("pdfjs-dist").PageViewport;
}> {
  const pdfjsLib = await getPdfjs();
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice() });
  const doc = await loadingTask.promise;
  const page = await doc.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  const textContent = await page.getTextContent();

  return { canvas, width: viewport.width, height: viewport.height, textContent, viewport };
}
