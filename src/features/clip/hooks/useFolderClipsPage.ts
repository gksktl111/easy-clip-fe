"use client";

import { useCallback } from "react";
import { useClipCollectionFilter } from "@/features/clip/hooks/useClipCollectionFilter";
import { useClipContextMenu } from "@/features/clip/hooks/useClipContextMenu";
import { useClipCopyAction } from "@/features/clip/hooks/useClipCopyAction";
import { useClipDeletion } from "@/features/clip/hooks/useClipDeletion";
import { useFolderClipCapture } from "@/features/clip/hooks/useFolderClipCapture";
import { useClipFavoriteMutation } from "@/features/clip/mutations/useClipFavoriteMutation";
import { useInfiniteClipsQuery } from "@/features/clip/queries/useInfiniteClipsQuery";
import type { Clip } from "@/features/clip/model/clip";

interface UseFolderClipsPageOptions {
  folderId: string;
  onClipsDeleted?: () => void | Promise<void>;
}

// 폴더 클립의 조회, 수집, 메뉴와 삭제 하위 훅을 페이지 영역별 계약으로 조합합니다.
export const useFolderClipsPage = ({
  folderId,
  onClipsDeleted,
}: UseFolderClipsPageOptions) => {
  const filter = useClipCollectionFilter();
  const query = useInfiniteClipsQuery({
    folderId,
    filter: filter.activeFilter,
    searchQuery: filter.debouncedSearchQuery,
    enabled: Boolean(folderId),
  });
  const deletion = useClipDeletion({
    clips: query.clips,
    folderId,
    isAuthenticated: query.isAuthenticated,
    onDeleted: onClipsDeleted,
  });
  const isInteractionDisabled = deletion.isDeleteMode || deletion.isDeleting;
  const capture = useFolderClipCapture({
    folderId,
    isAuthenticated: query.isAuthenticated,
    isDisabled: isInteractionDisabled,
  });
  const contextMenu = useClipContextMenu({
    isDisabled: isInteractionDisabled,
  });
  const copy = useClipCopyAction({
    isAuthenticated: query.isAuthenticated,
    isDisabled: isInteractionDisabled,
  });
  const favorite = useClipFavoriteMutation({
    isAuthenticated: query.isAuthenticated,
  });
  const { activate, deactivate, isActive, isCreating } = capture;
  const {
    closeContextMenu,
    contextMenu: contextMenuState,
    openContextMenu,
  } = contextMenu;
  const { copyClip: copyClipAction, copyToast } = copy;
  const toggleFavorite = useCallback(
    (clip: Clip) => {
      if (!isInteractionDisabled) {
        void favorite.toggleFavorite(clip);
      }
    },
    [favorite, isInteractionDisabled],
  );
  const {
    cancelDeleteMode,
    closeDeleteAllModal,
    deleteAll,
    deleteClip,
    deleteSelected,
    enterDeleteMode: startDeleteMode,
    isDeleteAllOpen,
    isDeleteMode,
    isDeleting,
    openDeleteAllModal,
    selectedClipCount,
    selectedClipIds,
    toggleClipSelected,
  } = deletion;

  const activatePage = useCallback(() => {
    activate();
    closeContextMenu();
  }, [activate, closeContextMenu]);

  const enterDeleteMode = useCallback(() => {
    closeContextMenu();
    deactivate();
    startDeleteMode();
  }, [closeContextMenu, deactivate, startDeleteMode]);

  const copyClip = useCallback(
    (clip: Clip, event: React.MouseEvent<HTMLButtonElement>) =>
      copyClipAction(clip, { x: event.clientX, y: event.clientY }),
    [copyClipAction],
  );

  const copyClipFromMenu = useCallback(
    async (clip: Clip) => {
      await copyClipAction(clip);
      closeContextMenu();
    },
    [closeContextMenu, copyClipAction],
  );

  const deleteClipFromMenu = useCallback(
    (clipId: string) => {
      closeContextMenu();
      void deleteClip(clipId);
    },
    [closeContextMenu, deleteClip],
  );

  return {
    capture: {
      activatePage,
      isActive,
      isCreating,
    },
    collection: {
      commands: {
        copyClip,
        toggleFavorite,
      },
      filter: {
        activeFilter: filter.activeFilter,
        changeFilter: filter.changeFilter,
        changeSearchQuery: filter.changeSearchQuery,
        searchQuery: filter.searchQuery,
      },
      isFavoritePending: favorite.isPending,
      pendingFavoriteClipId: favorite.pendingClipId,
      results: {
        clips: query.clips,
        error: query.error,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isError: query.isError,
        isFetchingNextPage: query.isFetchingNextPage,
        isLoading: query.isLoading,
        refetch: query.refetch,
      },
    },
    contextMenu: {
      close: closeContextMenu,
      copyClip: copyClipFromMenu,
      deleteClip: deleteClipFromMenu,
      open: openContextMenu,
      state: contextMenuState,
    },
    deletion: {
      cancelDeleteMode,
      closeDeleteAllModal,
      deleteAll,
      deleteSelected,
      enterDeleteMode,
      isDeleteAllOpen,
      isDeleteMode,
      isDeleting,
      openDeleteAllModal,
      selectedClipCount,
      selectedClipIds,
      toggleClipSelected,
    },
    feedback: {
      copyToast,
    },
  };
};
