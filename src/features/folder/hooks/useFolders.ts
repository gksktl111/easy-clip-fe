"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { FolderItem } from "@/features/folder/model/folder";
import {
  EMPTY_FOLDERS,
  FOLDER_STORAGE_KEY,
  persistFolders,
  readFolders,
  subscribeToFolders,
} from "@/features/folder/service/folderStorage";

export const useFolders = () => {
  const lastRawRef = useRef<string | null>(null);
  const lastFoldersRef = useRef<FolderItem[]>(EMPTY_FOLDERS);

  const getFoldersSnapshot = useCallback(() => {
    const stored = localStorage.getItem(FOLDER_STORAGE_KEY);
    if (stored === lastRawRef.current) {
      return lastFoldersRef.current;
    }

    const nextFolders = readFolders();
    lastRawRef.current = stored;
    lastFoldersRef.current = nextFolders;
    return nextFolders;
  }, []);

  const folders = useSyncExternalStore(
    subscribeToFolders,
    getFoldersSnapshot,
    () => EMPTY_FOLDERS,
  );

  return {
    folders,
    persistFolders,
  };
};
