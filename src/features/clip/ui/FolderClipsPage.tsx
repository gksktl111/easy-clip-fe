"use client";

import { useTranslations } from "next-intl";
import { useFolderClipsPage } from "@/features/clip/hooks/useFolderClipsPage";
import { ClipList } from "@/features/clip/ui/ClipList";
import { DeleteAllButton } from "@/features/clip/ui/DeleteAllButton";
import { EmptyState } from "@/features/clip/ui/EmptyState";
import { FilterBar } from "@/features/clip/ui/FilterBar";

export function FolderClipsPage() {
  const t = useTranslations("clips");
  const {
    activeFilter,
    clips,
    contextMenu,
    copyToast,
    filteredClips,
    handleCopy,
    handleCopyFromMenu,
    handleDeleteAll,
    handleDeleteClip,
    handleOpenContextMenu,
    handleOpenRename,
    handleRenameClip,
    handleToggleFavorite,
    hasClips,
    isActive,
    isDeleteAllOpen,
    isRenameOpen,
    renameInputRef,
    renameName,
    searchQuery,
    setActiveFilter,
    setContextMenu,
    setIsActive,
    setIsDeleteAllOpen,
    setIsRenameOpen,
    setRenameName,
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
        <div className="px-6 pt-4">
          <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-center text-xs text-(--muted)">
            {t("captureHint")}
          </div>
        </div>
      ) : null}
      {filteredClips.length ? (
        <ClipList
          clips={filteredClips}
          onCopy={handleCopy}
          onToggleFavorite={handleToggleFavorite}
          onContextMenu={handleOpenContextMenu}
        />
      ) : (
        <EmptyState />
      )}
      <DeleteAllButton
        disabled={!hasClips}
        onClick={() => setIsDeleteAllOpen(true)}
      />

      {contextMenu ? (
        <div
          className="fixed z-50 w-36 rounded-lg border border-(--border) bg-(--surface) p-1 text-xs text-(--muted) shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          data-clip-menu
        >
          <button
            type="button"
            onClick={() => {
              const target = clips.find((clip) => clip.id === contextMenu.id);
              if (target) {
                handleCopyFromMenu(target);
              }
            }}
            className="hover:text-foreground flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-(--muted) hover:bg-(--surface-muted)"
            data-clip-menu
          >
            {t("actions.copy")}
          </button>
          <button
            type="button"
            onClick={() => {
              const target = clips.find((clip) => clip.id === contextMenu.id);
              if (target) {
                handleOpenRename(target.id, target.name);
              }
            }}
            className="hover:text-foreground flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-(--muted) hover:bg-(--surface-muted)"
            data-clip-menu
          >
            {t("actions.rename")}
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClip(contextMenu.id)}
            className="flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-(--danger) hover:bg-(--surface-muted)"
            data-clip-menu
          >
            {t("actions.delete")}
          </button>
        </div>
      ) : null}

      {copyToast ? (
        <div
          className="fixed z-50 rounded-full bg-(--chip-bg) px-3 py-1.5 text-xs font-semibold text-(--chip-text) shadow-md"
          style={{ left: copyToast.x + 12, top: copyToast.y + 12 }}
        >
          {t("copyToast")}
        </div>
      ) : null}

      {isDeleteAllOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
          <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
            <div className="border-b border-(--border) px-5 py-4">
              <p className="text-foreground text-sm font-semibold">
                {t("deleteModal.title")}
              </p>
              <p className="text-muted mt-1 text-xs">
                {t("deleteModal.description")}
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
                className="hover:text-foreground rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
              >
                {t("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="rounded-lg bg-(--danger) px-4 py-2 text-sm font-medium text-danger-foreground transition hover:bg-(--danger-hover)"
              >
                {t("actions.delete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRenameOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
          <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
            <div className="border-b border-(--border) px-5 py-4">
              <p className="text-foreground text-sm font-semibold">
                {t("renameModal.title")}
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-(--muted)">
                {t("renameModal.label")}
              </label>
              <input
                ref={renameInputRef}
                value={renameName}
                onChange={(event) => setRenameName(event.target.value)}
                className="text-foreground mt-2 w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:outline-none"
                placeholder={t("renameModal.placeholder")}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
              <button
                type="button"
                onClick={() => setIsRenameOpen(false)}
                className="hover:text-foreground cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
              >
                {t("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={handleRenameClip}
                className="cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-(--primary-hover)"
              >
                {t("actions.change")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
