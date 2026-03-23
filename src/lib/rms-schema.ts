/**
 * Resume Metadata Standard (RMS) v2 Schema Definition
 * Based on: https://github.com/rezi-io/resume-standard
 *
 * XMP metadata keys follow the pattern: rms_{section}_{index}_{field}
 * Special cases: rms_contact_{field}, rms_summary, rms_{section}_count
 */

// ─── Section Field Definitions ───────────────────────────────────────────────

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "integer" | "monthyear";
  placeholder?: string;
}

export interface SectionDef {
  name: string;
  label: string;
  indexed: boolean;
  maxItems: number;
  primaryField: string; // The field used as the "title" in the UI
  fields: FieldDef[];
}

// ─── Contact (single instance, no index) ─────────────────────────────────────

export const contactFields: FieldDef[] = [
  { key: "fullName", label: "Full Name", type: "text", placeholder: "Charles Bloomberg" },
  { key: "givenNames", label: "Given Names", type: "text", placeholder: "Charles" },
  { key: "lastName", label: "Last Name", type: "text", placeholder: "Bloomberg" },
  { key: "email", label: "Email", type: "text", placeholder: "charles@email.com" },
  { key: "phone", label: "Phone", type: "text", placeholder: "(555) 123-4567" },
  { key: "linkedin", label: "LinkedIn", type: "text", placeholder: "in/username" },
  { key: "github", label: "GitHub", type: "text", placeholder: "github.com/username" },
  { key: "behance", label: "Behance", type: "text", placeholder: "behance.net/username" },
  { key: "dribble", label: "Dribbble", type: "text", placeholder: "dribbble.com/username" },
  { key: "website", label: "Website", type: "text", placeholder: "www.example.com" },
  { key: "country", label: "Country", type: "text", placeholder: "United States" },
  { key: "countryCode", label: "Country Code (ISO)", type: "text", placeholder: "US" },
  { key: "city", label: "City", type: "text", placeholder: "New York" },
  { key: "state", label: "State", type: "text", placeholder: "New York" },
];

// ─── Indexed Sections ────────────────────────────────────────────────────────

export const sections: SectionDef[] = [
  {
    name: "experience",
    label: "Experience",
    indexed: true,
    maxItems: 16,
    primaryField: "company",
    fields: [
      { key: "company", label: "Company", type: "text", placeholder: "Acme Corp" },
      { key: "role", label: "Role / Title", type: "text", placeholder: "Software Engineer" },
      { key: "location", label: "Location", type: "text", placeholder: "New York, NY" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Led development of..." },
      { key: "dateBegin", label: "Start Date", type: "monthyear" },
      { key: "dateEnd", label: "End Date", type: "monthyear" },
      { key: "isCurrent", label: "Current Position", type: "boolean" },
    ],
  },
  {
    name: "education",
    label: "Education",
    indexed: true,
    maxItems: 16,
    primaryField: "institution",
    fields: [
      { key: "institution", label: "Institution", type: "text", placeholder: "MIT" },
      { key: "qualification", label: "Qualification", type: "text", placeholder: "Bachelor of Science in CS" },
      { key: "location", label: "Location", type: "text", placeholder: "Cambridge, MA" },
      { key: "date", label: "Graduation Date", type: "monthyear" },
      { key: "isGraduate", label: "Graduated", type: "boolean" },
      { key: "minor", label: "Minor", type: "text", placeholder: "Mathematics" },
      { key: "score", label: "Score", type: "text", placeholder: "3.81" },
      { key: "scoreType", label: "Score Type", type: "text", placeholder: "GPA" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Relevant coursework..." },
    ],
  },
  {
    name: "certification",
    label: "Certifications",
    indexed: true,
    maxItems: 16,
    primaryField: "name",
    fields: [
      { key: "name", label: "Name", type: "text", placeholder: "PMP" },
      { key: "department", label: "Department / Issuer", type: "text", placeholder: "PMI" },
      { key: "date", label: "Date", type: "monthyear" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Certified in..." },
    ],
  },
  {
    name: "coursework",
    label: "Coursework",
    indexed: true,
    maxItems: 16,
    primaryField: "name",
    fields: [
      { key: "name", label: "Course Name", type: "text", placeholder: "Intro to Computer Systems" },
      { key: "department", label: "Department", type: "text", placeholder: "University of Wisconsin" },
      { key: "date", label: "Date", type: "monthyear" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Worked on..." },
      { key: "skill", label: "Skill", type: "text", placeholder: "Teamwork" },
    ],
  },
  {
    name: "involvement",
    label: "Involvement",
    indexed: true,
    maxItems: 16,
    primaryField: "organization",
    fields: [
      { key: "organization", label: "Organization", type: "text", placeholder: "Economics Student Association" },
      { key: "location", label: "Location", type: "text", placeholder: "University of Wisconsin" },
      { key: "role", label: "Role", type: "text", placeholder: "Selected Member" },
      { key: "dateBegin", label: "Start Date", type: "monthyear" },
      { key: "dateEnd", label: "End Date", type: "monthyear" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Participated in..." },
    ],
  },
  {
    name: "project",
    label: "Projects",
    indexed: true,
    maxItems: 16,
    primaryField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Web App" },
      { key: "organization", label: "Organization", type: "text", placeholder: "Habitat for Humanity" },
      { key: "role", label: "Role", type: "text", placeholder: "Lead Developer" },
      { key: "dateBegin", label: "Start Date", type: "monthyear" },
      { key: "dateEnd", label: "End Date", type: "monthyear" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Built a..." },
      { key: "url", label: "URL", type: "text", placeholder: "https://github.com/user/repo" },
    ],
  },
  {
    name: "skill",
    label: "Skills",
    indexed: true,
    maxItems: 16,
    primaryField: "category",
    fields: [
      { key: "category", label: "Category", type: "text", placeholder: "Languages" },
      { key: "keywords", label: "Keywords", type: "text", placeholder: "Python, JavaScript, SQL" },
    ],
  },
  {
    name: "publication",
    label: "Publications",
    indexed: true,
    maxItems: 16,
    primaryField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "ML for NLP" },
      { key: "organization", label: "Organization", type: "text", placeholder: "IEEE" },
      { key: "role", label: "Role", type: "text", placeholder: "Lead Author" },
      { key: "date", label: "Date", type: "monthyear" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Researched..." },
      { key: "type", label: "Type", type: "text", placeholder: "Academic Journal" },
    ],
  },
  {
    name: "award",
    label: "Awards",
    indexed: true,
    maxItems: 16,
    primaryField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Excellence in Research" },
      { key: "organization", label: "Organization", type: "text", placeholder: "CS Department" },
      { key: "date", label: "Date", type: "monthyear" },
      { key: "description", label: "Description", type: "textarea", placeholder: "• Awarded for..." },
    ],
  },
  {
    name: "reference",
    label: "References",
    indexed: true,
    maxItems: 16,
    primaryField: "name",
    fields: [
      { key: "name", label: "Name", type: "text", placeholder: "Dr. Jane Smith" },
      { key: "phone", label: "Phone", type: "text", placeholder: "(555) 123-4567" },
      { key: "email", label: "Email", type: "text", placeholder: "jane@university.edu" },
      { key: "type", label: "Type", type: "text", placeholder: "Professional" },
      { key: "organization", label: "Organization", type: "text", placeholder: "UC Berkeley" },
      { key: "role", label: "Role", type: "text", placeholder: "Department Chair" },
    ],
  },
];

// ─── TypeScript types for the resume data model ──────────────────────────────

export interface ResumeContact {
  [key: string]: string;
}

export interface ResumeSectionItem {
  [key: string]: string;
}

export interface ResumeData {
  /** Whether the PDF had existing RMS metadata */
  hasMetadata: boolean;
  /** Essential fields */
  producer: string;
  schemaDetails: string;
  /** Summary */
  summary: string;
  /** Contact info */
  contact: ResumeContact;
  /** Indexed sections: experience, education, etc. */
  [sectionName: string]: unknown;
}

/**
 * Creates an empty ResumeData object with all sections initialized.
 */
export function createEmptyResumeData(): ResumeData {
  const data: ResumeData = {
    hasMetadata: false,
    producer: "rms_v2.0.1",
    schemaDetails: "https://github.com/rezi-io/resume-standard",
    summary: "",
    contact: {},
  };
  for (const section of sections) {
    data[section.name] = [] as ResumeSectionItem[];
  }
  return data;
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

// Convert an HTML month input value ("YYYY-MM") or human text ("MM/YYYY", "Month YYYY")
// into a Unix timestamp in ms (start of month, UTC) and a format string.
export function dateValueToTs(value: string): { ts: string; format: string } | null {
  if (!value || value === "Present" || value === "Current") return null;

  // HTML month input: "YYYY-MM"
  const isoMatch = value.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(Date.UTC(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, 1));
    return { ts: String(d.getTime()), format: "MMMM YYYY" };
  }

  // MM/YYYY
  const slashMatch = value.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const d = new Date(Date.UTC(parseInt(slashMatch[2]), parseInt(slashMatch[1]) - 1, 1));
    return { ts: String(d.getTime()), format: "MM/YYYY" };
  }

  // "Month YYYY" (e.g. "November 2015")
  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const monthMatch = value.match(/^(\w+)\s+(\d{4})$/);
  if (monthMatch) {
    const mIdx = months.findIndex((m) => m.toLowerCase().startsWith(monthMatch[1].toLowerCase().slice(0, 3)));
    if (mIdx !== -1) {
      const d = new Date(Date.UTC(parseInt(monthMatch[2]), mIdx, 1));
      return { ts: String(d.getTime()), format: "MMMM YYYY" };
    }
  }

  // Just a year
  const yearMatch = value.match(/^(\d{4})$/);
  if (yearMatch) {
    const d = new Date(Date.UTC(parseInt(yearMatch[1]), 0, 1));
    return { ts: String(d.getTime()), format: "YYYY" };
  }

  return null;
}

// Convert a Unix timestamp (ms) string back to "YYYY-MM" for the month input.
export function tsToMonthValue(ts: string): string {
  if (!ts || ts === "n/a") return "";
  const d = new Date(parseInt(ts, 10));
  if (isNaN(d.getTime())) return "";
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Format a "YYYY-MM" month input value for display (e.g. "November 2015")
export function monthValueToDisplay(value: string): string {
  if (!value) return "";
  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const m = value.match(/^(\d{4})-(\d{2})$/);
  if (!m) return value;
  const mIdx = parseInt(m[2], 10) - 1;
  return `${months[mIdx]} ${m[1]}`;
}


export function flatMetadataToResumeData(
  meta: Record<string, string>
): ResumeData {
  const data = createEmptyResumeData();
  data.hasMetadata = true;

  // Producer & schema
  data.producer = meta["Producer"] || meta["producer"] || "rms_v2.0.1";
  data.schemaDetails =
    meta["rms_schema_details"] ||
    "https://github.com/rezi-io/resume-standard";

  // Summary
  data.summary = meta["rms_summary"] || "";

  // Contact
  for (const field of contactFields) {
    const key = `rms_contact_${field.key}`;
    if (meta[key] && meta[key] !== "n/a") {
      data.contact[field.key] = meta[key];
    }
  }

  // Indexed sections
  for (const section of sections) {
    const countKey = `rms_${section.name}_count`;
    const count = parseInt(meta[countKey] || "0", 10);
    const items: ResumeSectionItem[] = [];

    for (let i = 0; i < count; i++) {
      const item: ResumeSectionItem = {};
      for (const field of section.fields) {
        const key = `rms_${section.name}_${i}_${field.key}`;
        if (meta[key] && meta[key] !== "n/a") {
          item[field.key] = meta[key];
        }
      }
      // For monthyear fields: if display value is missing, try to derive from TS
      const dateFields = ["dateBegin", "dateEnd", "date"];
      for (const df of dateFields) {
        if (!item[df]) {
          const ts = meta[`rms_${section.name}_${i}_${df}TS`];
          if (ts && ts !== "n/a") {
            item[df] = tsToMonthValue(ts);
          }
        }
      }
      // Only add if at least one field has a value
      if (Object.keys(item).length > 0) {
        items.push(item);
      }
    }

    data[section.name] = items;
  }

  return data;
}

/**
 * Convert structured ResumeData back into flat RMS metadata keys.
 */
export function resumeDataToFlatMetadata(
  data: ResumeData
): Record<string, string> {
  const meta: Record<string, string> = {};

  // Essential fields
  meta["Producer"] = data.producer || "rms_v2.0.1";
  meta["rms_schema_details"] =
    data.schemaDetails || "https://github.com/rezi-io/resume-standard";

  // Summary
  meta["rms_summary"] = data.summary || "n/a";

  // Contact
  for (const field of contactFields) {
    const value = data.contact[field.key];
    meta[`rms_contact_${field.key}`] = value || "n/a";
  }

  // Indexed sections
  for (const section of sections) {
    const items = (data[section.name] as ResumeSectionItem[]) || [];
    meta[`rms_${section.name}_count`] = String(items.length);

    for (let i = 0; i < items.length; i++) {
      for (const field of section.fields) {
        const value = items[i][field.key];
        meta[`rms_${section.name}_${i}_${field.key}`] = value || "n/a";

        // Auto-compute TS and format fields from monthyear picker values
        if (field.type === "monthyear" && value && value !== "Present" && value !== "Current") {
          const tsData = dateValueToTs(value);
          if (tsData) {
            meta[`rms_${section.name}_${i}_${field.key}TS`] = tsData.ts;
            meta[`rms_${section.name}_${i}_${field.key}Format`] = tsData.format;
          }
        }
      }
    }
  }

  return meta;
}
