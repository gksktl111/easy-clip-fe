"use client";

import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineSearch,
} from "react-icons/hi";
import { ClipType } from "../../types/clip";

export type FilterType = ClipType | "all";

interface FilterOption {
  id: FilterType;
  label: string;
  icon?: React.ReactNode;
}

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  isActive?: boolean;
  showStatus?: boolean;
  countLabel?: string;
}

export function FilterBar({
  activeFilter,
  onFilterChange,
  searchQuery = "",
  onSearchChange,
  isActive = false,
  showStatus = true,
  countLabel,
}: FilterBarProps) {
  const filters: FilterOption[] = [
    { id: "all", label: "All" },
    {
      id: "text",
      label: "Text",
      icon: <HiOutlineDocumentText className="h-4 w-4" aria-hidden />,
    },
    {
      id: "color",
      label: "Color",
      icon: <HiOutlineColorSwatch className="h-4 w-4" aria-hidden />,
    },
    {
      id: "image",
      label: "Image",
      icon: <HiOutlinePhotograph className="h-4 w-4" aria-hidden />,
    },
  ];

  return (
    <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? "bg-(--icon-chip) text-(--icon-chip-text)"
                : "bg-(--surface) text-(--muted) hover:bg-(--surface-muted)"
            }`}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {showStatus ? (
          <div className="flex items-center gap-2 text-xs text-(--muted)">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
              aria-hidden
            />
            <span>{isActive ? "Ready to paste" : "Not active"}</span>
          </div>
        ) : null}
        {countLabel ? (
          <span className="rounded-full bg-(--icon-chip) px-2.5 py-1 text-xs font-semibold text-(--icon-chip-text)">
            {countLabel}
          </span>
        ) : null}
        <div className="relative">
          <input
            type="text"
            placeholder="Search clips..."
            value={searchQuery}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="text-foreground h-9 w-64 rounded-lg border border-(--border) bg-(--input) pr-4 pl-10 text-sm placeholder:text-(--muted) focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
          />
          <HiOutlineSearch
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted)"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
