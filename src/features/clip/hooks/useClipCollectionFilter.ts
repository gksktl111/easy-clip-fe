"use client";

import { useState } from "react";
import type { ClipFilter } from "@/features/clip/model/clip";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

// 클립 컬렉션의 유형 필터와 검색어를 관리하고 query용 검색어를 debounce합니다.
export const useClipCollectionFilter = () => {
  const [activeFilter, setActiveFilter] = useState<ClipFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  return {
    activeFilter,
    changeFilter: setActiveFilter,
    changeSearchQuery: setSearchQuery,
    debouncedSearchQuery,
    searchQuery,
  };
};
