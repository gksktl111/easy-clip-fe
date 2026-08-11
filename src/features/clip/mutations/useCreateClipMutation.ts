"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createImageClip, createTextClip } from "@/features/clip/api/clipApi";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

type CreateClipVariables =
  | {
      type: "text";
      folderId: string;
      text: string;
    }
  | {
      type: "image";
      folderId: string;
      file: File;
    };

// 텍스트·이미지 클립 생성 요청과 완료 후 목록 갱신을 관리합니다.
export const useCreateClipMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: CreateClipVariables) =>
      variables.type === "text"
        ? createTextClip({
            folderId: variables.folderId,
            text: variables.text,
          })
        : createImageClip({
            folderId: variables.folderId,
            file: variables.file,
          }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
  });
  const { mutateAsync } = mutation;

  const createText = useCallback(
    (folderId: string, text: string) =>
      mutateAsync({ type: "text", folderId, text }),
    [mutateAsync],
  );
  const createImage = useCallback(
    (folderId: string, file: File) =>
      mutateAsync({ type: "image", folderId, file }),
    [mutateAsync],
  );

  return {
    createImage,
    createText,
    isPending: mutation.isPending,
  };
};
