"use client";

import React, { useState } from "react";
import { SectionDef, ResumeSectionItem, FieldDef, monthValueToDisplay } from "@/lib/rms-schema";

interface SectionEditorProps {
  section: SectionDef;
  items: ResumeSectionItem[];
  onChange: (items: ResumeSectionItem[]) => void;
}

export default function SectionEditor({
  section,
  items,
  onChange,
}: SectionEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    items.length > 0 ? 0 : null
  );

  const addItem = () => {
    const newItem: ResumeSectionItem = {};
    const newItems = [...items, newItem];
    onChange(newItems);
    setExpandedIndex(newItems.length - 1);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
    setExpandedIndex(newIndex);
  };

  const renderField = (item: ResumeSectionItem, index: number, field: FieldDef) => {
    const value = item[field.key] || "";

    if (field.type === "textarea") {
      return (
        <div key={field.key} className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label}
          </label>
          <textarea
            value={value}
            onChange={(e) => updateItem(index, field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-y"
          />
        </div>
      );
    }

    if (field.type === "boolean") {
      return (
        <div key={field.key} className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) =>
                updateItem(index, field.key, e.target.checked ? "true" : "false")
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
          </label>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </span>
        </div>
      );
    }

    if (field.type === "monthyear") {
      // End date fields can be "Present"
      const isEndDate = field.key === "dateEnd";
      const isPresent = value === "Present" || value === "Current";
      // Convert stored value (may be "Month YYYY", "MM/YYYY", or "YYYY-MM") to YYYY-MM for input
      const inputValue = isPresent ? "" : (value.match(/^\d{4}-\d{2}$/) ? value : "");
      const displayLabel = isPresent ? "Present" : (value ? monthValueToDisplay(inputValue) : "");

      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label}
            {displayLabel && (
              <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">({displayLabel})</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={isPresent ? "" : inputValue}
              disabled={isPresent}
              onChange={(e) => updateItem(index, field.key, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-40"
            />
            {isEndDate && (
              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={(e) =>
                    updateItem(index, field.key, e.target.checked ? "Present" : "")
                  }
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
              </label>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {field.label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => updateItem(index, field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500 text-sm italic">
          {`No ${section.label.toLowerCase()} entries yet. Click "Add" to create one.`}
        </p>
      )}

      {items.map((item, index) => {
        const isExpanded = expandedIndex === index;
        const title =
          item[section.primaryField] ||
          `${section.label} #${index + 1}`;

        return (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          >
            {/* Collapsed header */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                  {title}
                </span>
                {item.role && (
                  <span className="text-xs text-gray-500">— {item.role}</span>
                )}
                {item.dateBegin && (
                  <span className="text-xs text-gray-400">
                    ({item.dateBegin}
                    {item.dateEnd ? ` – ${item.dateEnd}` : ""})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Reorder buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, "up");
                  }}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, "down");
                  }}
                  disabled={index === items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(index);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 ml-2"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Expand chevron */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ml-1 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-900">
                {section.fields.map((field) => renderField(item, index, field))}
              </div>
            )}
          </div>
        );
      })}

      {items.length < section.maxItems && (
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {section.label.replace(/s$/, "")}
        </button>
      )}
    </div>
  );
}
