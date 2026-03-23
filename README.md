# Resume Metadata Editor

A browser-based editor for reading, writing, and embedding [Resume Metadata Standard (RMS) v2](https://github.com/rezi-io/resume-standard) XMP metadata into PDF resumes. Built with Next.js, TypeScript, and Tailwind CSS — exported as a fully static site.

**Your PDF never leaves your browser.** All processing — XMP parsing, metadata editing, PDF rewriting, and page rendering — happens entirely client-side with no server involved.

## Live Demo

👉 [https://hansconstantine.github.io/resume-metadata-editor/](https://hansconstantine.github.io/resume-metadata-editor/)

## Features

- **Read** – Upload a PDF and instantly see any existing RMS v2 metadata fields.
- **Edit** – Modify every field across all 10 sections: contact, summary, experience, education, skills, projects, certifications, coursework, involvement, publications, awards, and references.
- **Add** – Embed RMS metadata into a PDF that doesn't have any yet.
- **Preview** – Live PDF preview with zoom, pagination, and selectable text — side by side with the editor.
- **JSON Import/Export** – Export your metadata as JSON or import from a previous export.
- **Download** – Save and download a new PDF with the metadata embedded as XMP.
- **Privacy** – 100% client-side. Nothing is uploaded or stored anywhere.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Static Deployment

```bash
npm run build
```

Outputs a fully static site to the `out/` directory. Serve it from any static host (GitHub Pages, Netlify, Vercel, S3, etc.).

> **Note:** The app requires HTTP (not `file://`) due to the PDF.js worker. Use `npx serve out` for local static testing.

## How It Works

1. **Upload** a PDF resume via drag-and-drop or file picker.
2. The browser reads the PDF's XMP metadata stream and looks for `rms_*` keys.
3. If RMS metadata is found, it's loaded into the editor immediately.
4. If not, a blank form is ready for you to fill in from scratch.
5. A live PDF preview renders alongside the editor with zoom and text selection.
6. Edit any section using the tabbed interface.
7. Click **Save & Download** to get a new PDF with the metadata embedded as XMP.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx              # Main editor UI (all client-side)
├── components/
│   ├── FileUpload.tsx        # Drag-and-drop upload
│   ├── PdfPreview.tsx        # PDF page preview with zoom, pagination & text layer
│   ├── ContactEditor.tsx     # Contact info form (14 fields)
│   ├── SectionEditor.tsx     # Generic accordion section editor
│   └── MetadataBadge.tsx     # File info & RMS status badge
└── lib/
    ├── rms-schema.ts         # RMS v2 schema, interfaces & data conversion helpers
    └── pdf-client.ts         # XMP read/write (pdf-lib) + page rendering (pdfjs-dist)
```

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** – App Router, static export (`output: "export"`)
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[pdf-lib](https://pdf-lib.js.org/)** – Pure-JS PDF manipulation & XMP embedding

## Resume Metadata Standard

This tool implements [RMS v2](https://github.com/rezi-io/resume-standard). The standard stores structured resume data as XMP metadata inside PDF files using keys like:

- `rms_contact_fullName`, `rms_contact_email`, `rms_contact_phone`, etc.
- `rms_summary`
- `rms_experience_count`, `rms_experience_0_company`, `rms_experience_0_role`, etc.

This makes resumes machine-readable while preserving the original visual PDF format.

## License

MIT
