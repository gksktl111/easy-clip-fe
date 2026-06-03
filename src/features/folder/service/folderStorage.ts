"use client";

import { FolderItem } from "@/features/folder/model/folder";

export const FOLDER_STORAGE_KEY = "easy-clip-folders";
export const FOLDER_EVENT = "folders:change";
export const EMPTY_FOLDERS: FolderItem[] = [];

export const readFolderStorageRaw = () => localStorage.getItem(FOLDER_STORAGE_KEY);

export const readFolders = (): FolderItem[] => {
  const stored = readFolderStorageRaw();
  if (!stored) {
    return EMPTY_FOLDERS;
  }

  try {
    const parsed = JSON.parse(stored) as FolderItem[];
    return Array.isArray(parsed) ? parsed : EMPTY_FOLDERS;
  } catch {
    return EMPTY_FOLDERS;
  }
};

export const persistFolders = (folders: FolderItem[]) => {
  localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders));
  window.dispatchEvent(new Event(FOLDER_EVENT));
};

export const subscribeToFolders = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(FOLDER_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(FOLDER_EVENT, handler);
  };
};
