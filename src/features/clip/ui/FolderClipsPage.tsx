"use client";

import { ClipCaptureDraftPanel } from "@/features/clip/ui/ClipCaptureDraftPanel";
import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { ResourceAccessLoading } from "@/shared/access/ResourceAccessLoading";
import { ClipListSkeleton } from "@/features/clip/ui/ClipListSkeleton";
import { ResourceAccessNotice } from "@/shared/access/ResourceAccessNotice";
import { ApiError } from "@/shared/lib/apiClient";
import { useTranslations } from "next-intl";
import { HiOutlineClipboardCopy, HiOutlineTag } from "react-icons/hi";
import { useFolderClipsPage } from "@/features/clip/hooks/useFolderClipsPage";
import { isFolderNotFoundError } from "@/features/clip/service/folderClipQueryState";
import { ClipDeleteActionBar } from "@/features/clip/ui/ClipDeleteActionBar";
import { ClipContextMenu } from "@/features/clip/ui/ClipContextMenu";
import { ClipRenameModal } from "@/features/clip/ui/ClipRenameModal";
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
  folderName?: string;
  onClipsDeleted?: () => void | Promise<void>;
}

export function FolderClipsPage(props: FolderClipsPageProps) {
  const access = useResourceAccess();
  return (
    <FolderClipsContent key={`${access.scope}:${props.folderId}`} {...props} />
  );
}

function FolderClipsContent({
  folderId,
  folderName,
  onClipsDeleted,
}: FolderClipsPageProps) {
  const t = useTranslations("clips");
  const access = useResourceAccess();
  const { capture, collection, contextMenu, deletion, tags, rename } =
    useFolderClipsPage({ folderId, onClipsDeleted });
  const { commands, filter, results } = collection;
  const isFolderNotFound = isFolderNotFoundError(results.error);
  const hasClipLoadError = results.isError && results.clips.length === 0;

  if (access.status === "checking")
    return (
      <ResourceAccessLoading>
        <ClipListSkeleton />
      </ResourceAccessLoading>
    );
  if (access.status !== "ready") return <ResourceAccessNotice />;
  if (
    access.folderLocks[folderId] === true ||
    (results.error instanceof ApiError &&
      results.error.code === "PROJECT_LOCKED")
  )
    return <ResourceAccessNotice locked />;

  if (isFolderNotFound || !(folderId in access.folderLocks)) {
    return <FolderNotFoundState />;
  }

  return (
    <div
      className="bg-background relative flex h-full flex-col overflow-hidden"
      onClick={capture.activatePage}
    >
      {!hasClipLoadError ? (
        <FilterBar
          mobileTitle={folderName ?? ""}
          mobileActions={
            <Button
              size="sm"
              className="min-h-11 shrink-0 px-3"
              disabled={
                capture.isDisabled ||
                Boolean(capture.draft) ||
                capture.isCreating ||
                capture.isReadingClipboard
              }
              aria-busy={capture.isCreating || capture.isReadingClipboard}
              onClick={(event) => {
                event.stopPropagation();
                void capture.pasteFromClipboard();
              }}
            >
              <HiOutlineClipboardCopy className="h-4 w-4" aria-hidden />
              {capture.isCreating || capture.isReadingClipboard
                ? t("pastePending")
                : t("pasteAction")}
            </Button>
          }
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
              aria-label={t("tags.manage")}
              className="min-h-11 min-w-11 px-3 md:min-h-9 md:px-4"
            >
              <HiOutlineTag className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">{t("tags.manage")}</span>
            </Button>
          }
        />
      ) : null}
      {!hasClipLoadError ? (
        <FolderClipCaptureHint isActive={capture.isActive} />
      ) : null}
      <ClipCaptureDraftPanel
        draft={capture.draft}
        pending={capture.isCreating}
        onRetry={capture.retryDraft}
        onDiscard={capture.discardDraft}
      />
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
        pendingCopyClipId={collection.pendingCopyClipId}
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
