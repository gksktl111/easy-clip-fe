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

// 폴더 클립의 조회, 복사, 즐겨찾기, 컨텍스트 메뉴와 삭제 UI를 조합합니다.
export function FolderClipsPage() {
  const t = useTranslations("clips");
  const { capture, collection, contextMenu, deletion, feedback } =
    useFolderClipsPage();
  const { actions, filter, results } = collection;
  const hasClipLoadError = results.isError && results.clips.length === 0;

  return (
    <div
      className="bg-background relative flex h-full flex-col overflow-hidden"
      onClick={capture.activatePage}
    >
      {!hasClipLoadError ? (
        <FilterBar
          activeFilter={filter.activeFilter}
          onFilterChange={filter.changeFilter}
          searchQuery={filter.searchQuery}
          onSearchChange={filter.changeSearchQuery}
          isActive={capture.isActive}
          countLabel={t("count", { count: results.clips.length })}
        />
      ) : null}
      {!hasClipLoadError && !capture.isActive ? (
        <FolderClipCaptureHint message={t("captureHint")} />
      ) : null}
      <ClipResultsSection
        clips={results.clips}
        hasNextPage={results.hasNextPage}
        isError={results.isError}
        isFetchingNextPage={results.isFetchingNextPage}
        isLoading={results.isLoading}
        onFetchNextPage={() => {
          void results.fetchNextPage();
        }}
        onRetry={() => {
          void results.refetch();
        }}
        onCopy={actions.copyClip}
        onToggleFavorite={actions.toggleFavorite}
        onContextMenu={contextMenu.open}
        isDeleteMode={deletion.isDeleteMode}
        isInteractionDisabled={deletion.isDeleting}
        selectedClipIds={deletion.selectedClipIds}
        onToggleSelected={deletion.toggleClipSelected}
      />
      {!hasClipLoadError && !deletion.isDeleteMode ? (
        <ClipDeleteModeButton
          disabled={results.clips.length === 0 || deletion.isDeleting}
          label={t("actions.deleteClips")}
          onClick={deletion.enterDeleteMode}
        />
      ) : null}
      {!hasClipLoadError && deletion.isDeleteMode ? (
        <ClipDeleteActionBar
          selectedCount={deletion.selectedClipCount}
          totalCount={results.clips.length}
          isDeleting={deletion.isDeleting}
          onCancel={deletion.cancelDeleteMode}
          onDeleteSelected={deletion.deleteSelected}
          onRequestDeleteAll={deletion.openDeleteAllModal}
        />
      ) : null}

      {!deletion.isDeleteMode ? (
        <ClipContextMenu
          clips={results.clips}
          contextMenu={contextMenu.state}
          copyLabel={t("actions.copy")}
          deleteLabel={t("actions.delete")}
          onCopy={contextMenu.copyClip}
          onDelete={contextMenu.deleteClip}
        />
      ) : null}
      <ClipCopyToast label={t("copyToast")} position={feedback.copyToast} />
      <DeleteAllClipsModal
        isOpen={deletion.isDeleteAllOpen}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        cancelLabel={t("actions.cancel")}
        confirmLabel={
          deletion.isDeleting ? t("deleteMode.deleting") : t("actions.delete")
        }
        onCancel={deletion.closeDeleteAllModal}
        isConfirming={deletion.isDeleting}
        onConfirm={deletion.deleteAll}
      />
    </div>
  );
}
