"use client";

import { useTranslations } from "next-intl";
import { HiOutlineTag } from "react-icons/hi";
import { useFolderClipsPage } from "@/features/clip/hooks/useFolderClipsPage";
import { isFolderNotFoundError } from "@/features/clip/service/folderClipQueryState";
import { ClipDeleteActionBar } from "@/features/clip/ui/ClipDeleteActionBar";
import { ClipContextMenu } from "@/features/clip/ui/ClipContextMenu";
import { ClipRenameModal } from "@/features/clip/ui/ClipRenameModal";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { ClipTagEditorModal } from "@/features/clip/ui/ClipTagEditorModal";
import { ClipDeleteModeButton } from "@/features/clip/ui/ClipDeleteModeButton";
import { FilterBar } from "@/features/clip/ui/FilterBar";
import { FolderClipCaptureHint } from "@/features/clip/ui/FolderClipCaptureHint";
import { FolderNotFoundState } from "@/features/clip/ui/FolderNotFoundState";
import { ConfirmActionModal } from "@/shared/ui/overlay/ConfirmActionModal";
import { Button } from "@/shared/ui/button/Button";

// 폴더 클립의 조회, 복사, 즐겨찾기, 컨텍스트 메뉴와 삭제 UI를 조합합니다.
interface FolderClipsPageProps {
  folderId: string;
  onClipsDeleted?: () => void | Promise<void>;
}

export function FolderClipsPage({
  folderId,
  onClipsDeleted,
}: FolderClipsPageProps) {
  const t = useTranslations("clips");
  const { capture, collection, contextMenu, deletion, feedback, tags, rename } =
    useFolderClipsPage({ folderId, onClipsDeleted });
  const { commands, filter, results } = collection;
  const isFolderNotFound = isFolderNotFoundError(results.error);
  const hasClipLoadError = results.isError && results.clips.length === 0;

  if (isFolderNotFound) {
    return <FolderNotFoundState />;
  }

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
          isSaving={capture.isCreating}
          countLabel={t("count", { count: results.clips.length })}
          actions={
            <Button
              disabled={deletion.isDeleteMode || deletion.isDeleting}
              onClick={(event) => {
                event.stopPropagation();
                tags.openManager();
              }}
              variant="surfaceGhost"
              size="sm"
            >
              <HiOutlineTag className="h-4 w-4" aria-hidden />
              {t("tags.manage")}
            </Button>
          }
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
        isCreatingClip={capture.isCreating}
        onFetchNextPage={() => {
          void results.fetchNextPage();
        }}
        onRetry={() => {
          void results.refetch();
        }}
        onCopy={commands.copyClip}
        onToggleFavorite={commands.toggleFavorite}
        onEditTags={tags.openClipEditor}
        onContextMenu={contextMenu.open}
        isDeleteMode={deletion.isDeleteMode}
        isInteractionDisabled={deletion.isDeleting}
        isFavoriteMutationPending={collection.isFavoritePending}
        pendingFavoriteClipId={collection.pendingFavoriteClipId}
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
          renameLabel={t("actions.rename")}
          onRename={rename.open}
          deleteLabel={t("actions.delete")}
          editTagsLabel={t("tags.editAction")}
          onEditTags={tags.openClipEditor}
          onDelete={contextMenu.deleteClip}
        />
      ) : null}
      {rename.isOpen ? <ClipRenameModal {...rename} /> : null}
      <ClipCopyToast label={t("copyToast")} position={feedback.copyToast} />
      {tags.state ? (
        <ClipTagEditorModal
          key={
            tags.state.mode === "clip" ? `clip-${tags.state.clip.id}` : "manage"
          }
          initialView={tags.state.mode}
          clip={tags.state.mode === "clip" ? tags.state.clip : undefined}
          tags={tags.query.tags}
          isLoading={tags.query.isLoading}
          isQueryError={tags.query.isError}
          isSavingClipTags={tags.isSavingClipTags}
          isTagActionPending={tags.isTagActionPending}
          onClose={tags.close}
          onRetry={() => {
            void tags.query.refetch();
          }}
          onCreateTag={tags.create}
          onUpdateTag={tags.update}
          onDeleteTag={(tag) => tags.remove(tag.id)}
          onSaveClipTags={tags.saveClipTags}
        />
      ) : null}
      <ConfirmActionModal
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
