"use client";

import { createContext, useContext } from "react";

export interface ResourceAccessState {
  status: "checking" | "ready" | "error" | "incompatible";
  scope: string;
  isPro: boolean;
  folderLocks: Readonly<Record<string, boolean>>;
  canCreateFolder: boolean;
  refresh: () => Promise<void>;
}

export const ResourceAccessContext = createContext<ResourceAccessState>({
  status: "checking",
  scope: "unavailable",
  isPro: false,
  folderLocks: {},
  canCreateFolder: false,
  refresh: async () => {},
});
export const useResourceAccess = () => useContext(ResourceAccessContext);
