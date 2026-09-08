"use client";

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
  const [state, setState] = useState<ClipTagWorkspaceState>(null);
  const query = useFolderTagsQuery({
    enabled: state !== null && isAuthenticated,
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
      if (clip.folderId === folderId) {
        setState({ mode: "clip", clip });
      }
    },
    [folderId],
  );
  const openManager = useCallback(() => setState({ mode: "manage" }), []);

  return {
    close,
    createTag: folderTagMutations.createTag,
    isOpen: state !== null,
    isSavingClipTags: clipTagMutation.isPending,
    isTagActionPending: folderTagMutations.isPending,
    openClipEditor,
    openManager,
    query,
    removeTag: folderTagMutations.removeTag,
    saveClipTags: clipTagMutation.saveClipTags,
    state,
    updateTag: folderTagMutations.updateTag,
  };
};
