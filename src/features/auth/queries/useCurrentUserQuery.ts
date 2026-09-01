"use client";

import { useQuery } from "@tanstack/react-query";
import { currentUserQueryOptions } from "@/features/auth/queries/currentUserQueryOptions";

interface UseCurrentUserQueryOptions {
  enabled: boolean;
}

// 현재 사용자 정보는 React Query cache를 단일 원천으로 사용합니다.
export const useCurrentUserQuery = ({ enabled }: UseCurrentUserQueryOptions) =>
  useQuery({
    ...currentUserQueryOptions(),
    enabled,
  });
