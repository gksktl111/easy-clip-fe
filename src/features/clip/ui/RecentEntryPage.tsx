"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFolders } from "@/features/folder/hooks/useFolders";
import { RecentClipsPage } from "@/features/clip/ui/RecentClipsPage";

export function RecentEntryPage() {
  const router = useRouter();
  const { folders, isLoading } = useFolders();

  useEffect(() => {
    if (!folders.length) {
      return;
    }

    router.replace(`/${folders[0].id}/recent`);
  }, [folders, router]);

  if (isLoading) {
    return null;
  }

  if (!folders.length) {
    return <RecentClipsPage />;
  }

  return null;
}
