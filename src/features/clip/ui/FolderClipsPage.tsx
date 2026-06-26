"use client";

import { useTranslations } from "next-intl";
import { useFolderClipsPage } from "@/features/clip/hooks/useFolderClipsPage";
import { ClipContextMenu } from "@/features/clip/ui/ClipContextMenu";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { DeleteAllButton } from "@/features/clip/ui/DeleteAllButton";
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
    handleOpenContextMenu,
    handleToggleFavorite,
    hasNextPage,
    hasClips,
    isActive,
    isDeleteAllOpen,
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
  } = useFolderClipsPage();

  return (
    <div
      className="bg-background flex h-full flex-col overflow-hidden"
      onClick={() => {
        setIsActive(true);
        setContextMenu(null);
      }}
    >
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isActive={isActive}
        countLabel={t("count", { count: filteredClips.length })}
      />
      {!isActive ? (
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
      />
      <DeleteAllButton
        disabled={!hasClips}
        onClick={() => setIsDeleteAllOpen(true)}
      />

      <ClipContextMenu
        clips={clips}
        contextMenu={contextMenu}
        copyLabel={t("actions.copy")}
        deleteLabel={t("actions.delete")}
        onCopy={handleCopyFromMenu}
        onDelete={handleDeleteClip}
      />
      <ClipCopyToast label={t("copyToast")} position={copyToast} />
      <DeleteAllClipsModal
        isOpen={isDeleteAllOpen}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        cancelLabel={t("actions.cancel")}
        confirmLabel={t("actions.delete")}
        onCancel={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
      />
    </div>
  );
}
