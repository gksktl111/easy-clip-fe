"use client";

import { FolderItem } from "@/domains/folders/model/folder";

export const FOLDER_STORAGE_KEY = "easy-clip-folders";
export const FOLDER_EVENT = "folders:change";
export const EMPTY_FOLDERS: FolderItem[] = [];

export const readFolders = (): FolderItem[] => {
  const stored = localStorage.getItem(FOLDER_STORAGE_KEY);
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
