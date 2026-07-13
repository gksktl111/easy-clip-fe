"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipListSkeleton } from "@/features/clip/ui/ClipListSkeleton";
import { useFoldersQuery } from "@/features/folder/hooks/useFoldersQuery";

// 기본 컬렉션 경로를 첫 폴더 경로로 연결하고 폴더가 없으면 대체 화면을 표시합니다.
interface ClipEntryPageProps {
  fallback: ReactNode;
  section: "favorites" | "recent";
}

export function ClipEntryPage({ fallback, section }: ClipEntryPageProps) {
  const router = useRouter();
  const { folders, isLoading } = useFoldersQuery();

  useEffect(() => {
    if (!folders.length) {
      return;
    }

    router.replace(`/${folders[0].id}/${section}`);
  }, [folders, router, section]);

  if (isLoading) {
    return <ClipListSkeleton />;
  }

  if (!folders.length) {
    return fallback;
  }

  return null;
}
