"use client";

import { useTranslations } from "next-intl";
import { useFolderClipsPage } from "@/features/clip/hooks/useFolderClipsPage";
import { ClipDeleteActionBar } from "@/features/clip/ui/ClipDeleteActionBar";
import { ClipContextMenu } from "@/features/clip/ui/ClipContextMenu";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { ClipDeleteModeButton } from "@/features/clip/ui/ClipDeleteModeButton";
import { DeleteAllClipsModal } from "@/features/clip/ui/DeleteAllClipsModal";
import { FilterBar } from "@/features/clip/ui/FilterBar";
import { FolderClipCaptureHint } from "@/features/clip/ui/FolderClipCaptureHint";

export function FolderClipsPage() {
  const t = useTranslations("clips");
  const {
    activeFilter,
    clips,
    contextMenu,
    copyToast,
    fetchNextPage,
    filteredClips,
    handleCopy,
    handleCopyFromMenu,
    handleDeleteAll,
    handleDeleteClip,
    handleDeleteSelected,
    handleEnterDeleteMode,
    handleCancelDeleteMode,
    handleOpenContextMenu,
    handleToggleClipSelected,
    handleToggleFavorite,
    hasNextPage,
    hasClips,
    isActive,
    isDeleteAllOpen,
    isDeleteMode,
    isDeletingClips,
    isError,
    isFetchingNextPage,
    isLoading,
    refetchClips,
    searchQuery,
    setActiveFilter,
    setContextMenu,
    setIsActive,
    setIsDeleteAllOpen,
    setSearchQuery,
    selectedClipCount,
    selectedClipIds,
  } = useFolderClipsPage();
  const hasClipLoadError = isError && filteredClips.length === 0;

  return (
    <div
      className="bg-background relative flex h-full flex-col overflow-hidden"
      onClick={() => {
        if (!isDeleteMode && !isDeletingClips) {
          setIsActive(true);
        }
        setContextMenu(null);
      }}
    >
      {!hasClipLoadError ? (
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isActive={isActive}
          countLabel={t("count", { count: filteredClips.length })}
        />
      ) : null}
      {!hasClipLoadError && !isActive ? (
        <FolderClipCaptureHint message={t("captureHint")} />
      ) : null}
      <ClipResultsSection
        clips={filteredClips}
        hasNextPage={hasNextPage}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        onFetchNextPage={() => {
          void fetchNextPage();
        }}
        onRetry={() => {
          void refetchClips();
        }}
        onCopy={handleCopy}
        onToggleFavorite={handleToggleFavorite}
        onContextMenu={handleOpenContextMenu}
        isDeleteMode={isDeleteMode}
        isInteractionDisabled={isDeletingClips}
        selectedClipIds={selectedClipIds}
        onToggleSelected={handleToggleClipSelected}
      />
      {!hasClipLoadError && !isDeleteMode ? (
        <ClipDeleteModeButton
          disabled={!hasClips || isDeletingClips}
          label={t("actions.deleteClips")}
          onClick={handleEnterDeleteMode}
        />
      ) : null}
      {!hasClipLoadError && isDeleteMode ? (
        <ClipDeleteActionBar
          selectedCount={selectedClipCount}
          totalCount={filteredClips.length}
          isDeleting={isDeletingClips}
          onCancel={handleCancelDeleteMode}
          onDeleteSelected={handleDeleteSelected}
          onRequestDeleteAll={() => setIsDeleteAllOpen(true)}
        />
      ) : null}

      {!isDeleteMode ? (
        <ClipContextMenu
          clips={clips}
          contextMenu={contextMenu}
          copyLabel={t("actions.copy")}
          deleteLabel={t("actions.delete")}
          onCopy={handleCopyFromMenu}
          onDelete={handleDeleteClip}
        />
      ) : null}
      <ClipCopyToast label={t("copyToast")} position={copyToast} />
      <DeleteAllClipsModal
        isOpen={isDeleteAllOpen}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        cancelLabel={t("actions.cancel")}
        confirmLabel={
          isDeletingClips ? t("deleteMode.deleting") : t("actions.delete")
        }
        onCancel={() => {
          if (!isDeletingClips) {
            setIsDeleteAllOpen(false);
          }
        }}
        isConfirming={isDeletingClips}
        onConfirm={handleDeleteAll}
      />
    </div>
  );
}
