"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFolders } from "@/features/folder/hooks/useFolders";
import { FavoriteClipsPage } from "@/features/clip/ui/FavoriteClipsPage";

export function FavoritesEntryPage() {
  const router = useRouter();
  const { folders, isLoading } = useFolders();

  useEffect(() => {
    if (!folders.length) {
      return;
    }

    router.replace(`/${folders[0].id}/favorites`);
  }, [folders, router]);

  if (isLoading) {
    return null;
  }

  if (!folders.length) {
    return <FavoriteClipsPage />;
  }

  return null;
}
