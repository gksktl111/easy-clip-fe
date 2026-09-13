"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { canUseClipOrganization } from "@/features/clip/service/clipOrganizationAccess";
import { useState } from "react";
import type { ClipFilter } from "@/features/clip/model/clip";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

// 클립 컬렉션의 유형 필터와 검색어를 관리하고 query용 검색어를 debounce합니다.
export const useClipCollectionFilter = () => {
  const [activeFilter, setActiveFilter] = useState<ClipFilter>("all");
  const access = useResourceAccess();
  const canSearch = canUseClipOrganization(access);
  const identity = `${access.scope}:${canSearch}`;
  const [search, setSearch] = useState({ identity, value: "", revision: 0 });
  if (search.identity !== identity)
    setSearch({ identity, value: "", revision: search.revision + 1 });
  const debounced = useDebouncedValue(search);
  const searchQuery =
    canSearch && search.identity === identity ? search.value : "";
  const debouncedSearchQuery =
    canSearch &&
    search.identity === identity &&
    debounced.identity === identity &&
    debounced.revision === search.revision
      ? debounced.value
      : "";

  return {
    activeFilter,
    changeFilter: setActiveFilter,
    changeSearchQuery: (value: string) => {
      if (canSearch) setSearch({ identity, value, revision: search.revision });
    },
    debouncedSearchQuery,
    searchQuery,
  };
};
