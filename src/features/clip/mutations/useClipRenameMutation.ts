"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameClip } from "@/features/clip/api/clipApi";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

export const useClipRenameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clipId, title }: { clipId: string; title: string }) =>
      renameClip(clipId, { title }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
  });
};
