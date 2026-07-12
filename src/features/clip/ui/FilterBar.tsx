"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineSearch,
} from "react-icons/hi";
import type { ClipType } from "@/features/clip/model/clip";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { Select } from "@/shared/ui/input/Select";
import { TextInput } from "@/shared/ui/input/TextInput";

export type FilterType = ClipType | "all";

// 클립 유형 필터, 검색, 수집 상태와 결과 개수를 반응형으로 표시합니다.
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
    <TextInput
      placeholder={t("searchPlaceholder")}
      value={searchQuery}
      onChange={(event) => onSearchChange?.(event.target.value)}
      className="w-full min-[1200px]:w-64"
      inputClassName="h-11 pr-4 min-[1200px]:h-9 min-[1200px]:rounded-lg"
      leftIcon={<HiOutlineSearch className="h-4 w-4" aria-hidden />}
    />
  );

  const statusGroup = (
    <div className="flex w-full flex-wrap items-center justify-end gap-3 min-[1200px]:w-auto">
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
      {countLabel ? <Badge variant="chip">{countLabel}</Badge> : null}
    </div>
  );

  return (
    <div className="border-b border-(--border) px-4 py-4 min-[1200px]:px-6">
      <div className="flex flex-col gap-3 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
        <div className="min-[1200px]:hidden">
          <Select
            value={activeFilter}
            onChange={(value) => onFilterChange(value as FilterType)}
            options={filters.map((filter) => ({
              value: filter.id,
              label: filter.label,
            }))}
          />
        </div>

        <div className="hidden gap-2 min-[1200px]:flex">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              variant={activeFilter === filter.id ? "chip" : "surfaceGhost"}
              size="sm"
              className="px-4"
            >
              {filter.icon}
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="order-2 min-[1200px]:hidden">{searchField}</div>

        <div className="order-3 min-[1200px]:hidden">{statusGroup}</div>

        <div className="hidden items-center gap-3 min-[1200px]:flex">
          {statusGroup}
          {searchField}
        </div>
      </div>
    </div>
  );
}
