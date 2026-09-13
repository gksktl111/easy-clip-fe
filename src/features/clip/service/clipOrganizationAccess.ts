import type { ResourceAccessState } from "@/shared/access/ResourceAccessContext";
import { ApiError } from "@/shared/lib/apiClient";

export const canUseClipOrganization = (
  access: ResourceAccessState,
  folderId?: string,
) =>
  access.status === "ready" &&
  access.isPro &&
  (folderId === undefined || access.folderLocks[folderId] === false);

export const assertClipOrganizationAccess = (
  access: ResourceAccessState,
  folderId: string,
) => {
  if (!canUseClipOrganization(access, folderId)) {
    throw new ApiError("Pro access is required", 403, "FEATURE_NOT_AVAILABLE");
  }
};
