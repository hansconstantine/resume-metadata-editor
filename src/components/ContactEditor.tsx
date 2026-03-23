"use client";

import React from "react";
import { contactFields, FieldDef } from "@/lib/rms-schema";

interface ContactEditorProps {
  contact: Record<string, string>;
  onChange: (contact: Record<string, string>) => void;
}

export default function ContactEditor({ contact, onChange }: ContactEditorProps) {
  const handleFieldChange = (field: FieldDef, value: string) => {
    onChange({ ...contact, [field.key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactFields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={contact[field.key] || ""}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
