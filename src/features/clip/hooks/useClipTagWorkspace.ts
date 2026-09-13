"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { canUseClipOrganization } from "@/features/clip/service/clipOrganizationAccess";
import { useCallback, useState } from "react";
import type { Clip } from "@/features/clip/model/clip";
import { useClipTagsMutation } from "@/features/clip/mutations/useClipTagsMutation";
import { useFolderTagMutations } from "@/features/clip/mutations/useFolderTagMutations";
import { useFolderTagsQuery } from "@/features/clip/queries/useFolderTagsQuery";

export type ClipTagWorkspaceState =
  | { mode: "clip"; clip: Clip }
  | { mode: "manage" }
  | null;

interface UseClipTagWorkspaceOptions {
  folderId: string;
  isAuthenticated: boolean;
}

export const useClipTagWorkspace = ({
  folderId,
  isAuthenticated,
}: UseClipTagWorkspaceOptions) => {
  const access = useResourceAccess();
  const canManageTags =
    isAuthenticated && canUseClipOrganization(access, folderId);
  const [state, setState] = useState<ClipTagWorkspaceState>(null);
  if (!canManageTags && state !== null) setState(null);
  const query = useFolderTagsQuery({
    enabled: state !== null && canManageTags,
    folderId,
  });
  const folderTagMutations = useFolderTagMutations({
    folderId,
    isAuthenticated,
  });
  const clipTagMutation = useClipTagsMutation({
    folderId,
    isAuthenticated,
  });

  const close = useCallback(() => setState(null), []);
  const openClipEditor = useCallback(
    (clip: Clip) => {
      if (canManageTags && clip.folderId === folderId) {
        setState({ mode: "clip", clip });
      }
    },
    [canManageTags, folderId],
  );
  const openManager = useCallback(() => {
    if (canManageTags) setState({ mode: "manage" });
  }, [canManageTags]);

  return {
    close,
    createTag: folderTagMutations.createTag,
    isOpen: canManageTags && state !== null,
    isSavingClipTags: clipTagMutation.isPending,
    isTagActionPending: folderTagMutations.isPending,
    openClipEditor,
    openManager,
    query,
    removeTag: folderTagMutations.removeTag,
    saveClipTags: clipTagMutation.saveClipTags,
    state: canManageTags ? state : null,
    updateTag: folderTagMutations.updateTag,
  };
};
