"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineSearch,
} from "react-icons/hi";
import { ClipType } from "@/features/clip/model/clip";
import { StyledSelect } from "@/shared/ui/StyledSelect";

export type FilterType = ClipType | "all";

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
  const t = useTranslations("clips.filter");
  const filters = [
    { id: "all" as const, label: t("all") },
    {
      id: "text" as const,
      label: t("text"),
      icon: <HiOutlineDocumentText className="h-4 w-4" aria-hidden />,
    },
    {
      id: "color" as const,
      label: t("color"),
      icon: <HiOutlineColorSwatch className="h-4 w-4" aria-hidden />,
    },
    {
      id: "image" as const,
      label: t("image"),
      icon: <HiOutlinePhotograph className="h-4 w-4" aria-hidden />,
    },
  ];

  const searchField = (
    <div className="relative">
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={searchQuery}
        onChange={(event) => onSearchChange?.(event.target.value)}
        className="text-foreground h-11 w-full rounded-xl border border-(--border) bg-(--input) pr-4 pl-10 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:ring-1 focus:ring-(--focus-ring) focus:outline-none md:h-9 md:w-64 md:rounded-lg"
      />
      <HiOutlineSearch
        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted)"
        aria-hidden
      />
    </div>
  );

  const statusGroup = (
    <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
      {showStatus ? (
        <div className="flex items-center gap-2 text-xs text-(--muted)">
          <span
            className={`h-2 w-2 rounded-full ${
              isActive ? "bg-(--success)" : "bg-(--danger)"
            }`}
            aria-hidden
          />
          <span>{isActive ? t("readyToPaste") : t("notActive")}</span>
        </div>
      ) : null}
      {countLabel ? (
        <span className="rounded-full bg-(--icon-chip) px-2.5 py-1 text-xs font-semibold text-(--icon-chip-text)">
          {countLabel}
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="border-b border-(--border) px-4 py-4 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="md:hidden">
          <StyledSelect
            value={activeFilter}
            onChange={(value) => onFilterChange(value as FilterType)}
            options={filters.map((filter) => ({
              value: filter.id,
              label: filter.label,
            }))}
          />
        </div>

        <div className="hidden gap-2 md:flex">
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

        <div className="order-2 md:hidden">{searchField}</div>

        <div className="order-3 md:hidden">{statusGroup}</div>

        <div className="hidden items-center gap-3 md:flex">
          {statusGroup}
          {searchField}
        </div>
      </div>
    </div>
  );
}
