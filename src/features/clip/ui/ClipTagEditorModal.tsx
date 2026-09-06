"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  HiArrowLeft,
  HiCheck,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineSearch,
  HiX,
} from "react-icons/hi";
import type { Clip } from "@/features/clip/model/clip";
import type { FolderTag, TagBackgroundColor } from "@/features/clip/model/tag";
import {
  getTagNameLength,
  getTagNameValidationError,
  getUniqueTagNames,
} from "@/features/clip/service/tagNameValidation";
import { FolderTagManagerPanel } from "@/features/clip/ui/FolderTagManagerPanel";
import { TagChip } from "@/features/clip/ui/TagChip";
import { TagColorPicker } from "@/features/clip/ui/TagColorPicker";
import { ApiError } from "@/shared/lib/apiClient";
import { Button } from "@/shared/ui/button/Button";
import { TextInput } from "@/shared/ui/input/TextInput";
import { Modal } from "@/shared/ui/overlay/Modal";

interface ClipTagEditorModalProps {
  clip?: Clip;
  initialView: "clip" | "manage";
  isLoading: boolean;
  isQueryError: boolean;
  isSavingClipTags: boolean;
  isTagActionPending: boolean;
  onClose: () => void;
  onCreateTag: (
    name: string,
    backgroundColor?: TagBackgroundColor,
  ) => Promise<FolderTag>;
  onDeleteTag: (tag: FolderTag) => Promise<unknown>;
  onRetry: () => void;
  onSaveClipTags: (clipId: string, tagNames: string[]) => Promise<unknown>;
  onUpdateTag: (
    tagId: string,
    payload: { name?: string; backgroundColor?: TagBackgroundColor },
  ) => Promise<FolderTag>;
  tags: FolderTag[];
}

export function ClipTagEditorModal({
  clip,
  initialView,
  isLoading,
  isQueryError,
  isSavingClipTags,
  isTagActionPending,
  onClose,
  onCreateTag,
  onDeleteTag,
  onRetry,
  onSaveClipTags,
  onUpdateTag,
  tags,
}: ClipTagEditorModalProps) {
  const t = useTranslations("clips.tags");
  const [view, setView] = useState(initialView);
  const [selectedNames, setSelectedNames] = useState<string[]>(
    clip?.tags.map((tag) => tag.name) ?? [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagColor, setNewTagColor] = useState<TagBackgroundColor>("GRAY");
  const [inputError, setInputError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isBusy = isSavingClipTags || isTagActionPending;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isBusy, onClose]);

  const filteredTags = useMemo(() => {
    const normalizedQuery = searchQuery.toLocaleLowerCase();
    if (!normalizedQuery) {
      return tags;
    }

    return tags.filter((tag) =>
      tag.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery, tags]);

  const selectedTags = selectedNames.map((name) => {
    const existingTag = tags.find((tag) => tag.name === name);
    return {
      name,
      backgroundColor: existingTag?.backgroundColor ?? ("GRAY" as const),
    };
  });
  const exactTagExists = tags.some((tag) => tag.name === searchQuery);
  const validationError = getTagNameValidationError(searchQuery);
  const canCreateFromSearch = Boolean(searchQuery) && !exactTagExists;

  const getRequestErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        return t("errors.invalid");
      }
      if (error.status === 404) {
        return t("errors.notFound");
      }
      if (error.status === 409) {
        return t("errors.conflict");
      }
    }

    return t("errors.actionFailed");
  };

  const toggleTag = (name: string) => {
    setActionError(null);
    setSelectedNames((currentNames) =>
      currentNames.includes(name)
        ? currentNames.filter((currentName) => currentName !== name)
        : [...currentNames, name],
    );
  };

  const addPendingTag = () => {
    if (!canCreateFromSearch) {
      return;
    }

    if (validationError) {
      setInputError(t(`validation.${validationError}`));
      return;
    }

    setSelectedNames((currentNames) =>
      getUniqueTagNames([...currentNames, searchQuery]),
    );
    setSearchQuery("");
    setInputError(null);
    setActionError(null);
  };

  const createColoredTag = async () => {
    if (!canCreateFromSearch || validationError || isBusy) {
      if (validationError) {
        setInputError(t(`validation.${validationError}`));
      }
      return;
    }

    setInputError(null);
    setActionError(null);

    try {
      const createdTag = await onCreateTag(searchQuery, newTagColor);
      setSelectedNames((currentNames) =>
        getUniqueTagNames([...currentNames, createdTag.name]),
      );
      setSearchQuery("");
      setNewTagColor("GRAY");
    } catch (error) {
      const message = getRequestErrorMessage(error);
      if (error instanceof ApiError && [400, 409].includes(error.status)) {
        setInputError(message);
      } else {
        setActionError(message);
      }
    }
  };

  const saveClipTags = async () => {
    if (!clip || isBusy) {
      return;
    }

    setActionError(null);
    try {
      await onSaveClipTags(clip.id, selectedNames);
      onClose();
    } catch (error) {
      setActionError(getRequestErrorMessage(error));
    }
  };

  const close = () => {
    if (!isBusy) {
      onClose();
    }
  };

  const title = view === "manage" ? t("manageTitle") : t("editorTitle");

  return (
    <Modal onClose={close} contentClassName="w-full max-w-lg" className="py-4">
      <section
        className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface-elevated) shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clip-tag-modal-title"
      >
        <header className="flex items-center gap-2 border-b border-(--border) px-4 py-3">
          {view === "manage" && clip ? (
            <Button
              disabled={isBusy}
              onClick={() => setView("clip")}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label={t("backToSelection")}
            >
              <HiArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2
              id="clip-tag-modal-title"
              className="truncate text-sm font-semibold text-(--foreground)"
            >
              {title}
            </h2>
            {view === "clip" && clip ? (
              <p className="mt-0.5 truncate text-xs text-(--muted)">
                {clip.name}
              </p>
            ) : null}
          </div>
          <Button
            disabled={isBusy}
            onClick={close}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            aria-label={t("close")}
          >
            <HiX className="h-5 w-5" aria-hidden />
          </Button>
        </header>

        <div className="clip-scrollbar overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="space-y-3" aria-label={t("loading")}>
              <div className="skeleton-shimmer h-10 rounded-lg" />
              <div className="skeleton-shimmer h-28 rounded-lg" />
            </div>
          ) : isQueryError ? (
            <div className="rounded-xl bg-(--surface-muted) px-5 py-8 text-center">
              <p className="text-sm text-(--muted)" role="alert">
                {t("errors.loadFailed")}
              </p>
              <Button
                onClick={onRetry}
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                {t("retry")}
              </Button>
            </div>
          ) : view === "manage" ? (
            <FolderTagManagerPanel
              tags={tags}
              isPending={isTagActionPending}
              onCreate={onCreateTag}
              onUpdate={onUpdateTag}
              onDelete={onDeleteTag}
              onRename={(previousName, updatedTag) =>
                setSelectedNames((currentNames) =>
                  getUniqueTagNames(
                    currentNames.map((name) =>
                      name === previousName ? updatedTag.name : name,
                    ),
                  ),
                )
              }
              onDeleted={(tag) =>
                setSelectedNames((currentNames) =>
                  currentNames.filter((name) => name !== tag.name),
                )
              }
            />
          ) : (
            <div>
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-(--muted)">
                  {t("selectedLabel")}
                </p>
                <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-2">
                  {selectedTags.length ? (
                    selectedTags.map((tag) => (
                      <TagChip
                        key={tag.name}
                        name={tag.name}
                        backgroundColor={tag.backgroundColor}
                        onRemove={() => toggleTag(tag.name)}
                        removeLabel={t("removeFromClip", { name: tag.name })}
                      />
                    ))
                  ) : (
                    <span className="text-sm text-(--muted)">
                      {t("noneSelected")}
                    </span>
                  )}
                </div>
              </div>

              <TextInput
                autoFocus
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setInputError(null);
                  setActionError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canCreateFromSearch) {
                    event.preventDefault();
                    addPendingTag();
                  }
                }}
                placeholder={t("searchPlaceholder")}
                leftIcon={<HiOutlineSearch className="h-4 w-4" aria-hidden />}
                inputClassName="rounded-lg py-2.5"
                aria-invalid={Boolean(inputError)}
                aria-describedby={
                  inputError ? "clip-tag-input-error" : undefined
                }
              />
              <div className="mt-1 flex items-start justify-between gap-3 text-xs">
                <span
                  id="clip-tag-input-error"
                  className="text-(--danger-text)"
                >
                  {inputError}
                </span>
                <span className="shrink-0 text-(--muted)">
                  {getTagNameLength(searchQuery)}/10
                </span>
              </div>

              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-(--border) bg-(--surface)">
                {filteredTags.length ? (
                  <ul className="py-1">
                    {filteredTags.map((tag) => {
                      const isSelected = selectedNames.includes(tag.name);
                      return (
                        <li key={tag.id}>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => toggleTag(tag.name)}
                            className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--focus-ring) disabled:cursor-default disabled:opacity-50"
                            aria-pressed={isSelected}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                              {isSelected ? (
                                <HiCheck className="h-4 w-4" aria-hidden />
                              ) : null}
                            </span>
                            <TagChip
                              name={tag.name}
                              backgroundColor={tag.backgroundColor}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-4 py-5 text-center text-sm text-(--muted)">
                    {t("noSearchResults")}
                  </p>
                )}
              </div>

              {canCreateFromSearch ? (
                <div className="mt-3 rounded-xl border border-(--border) bg-(--surface-muted) p-3">
                  <Button
                    disabled={isBusy}
                    onClick={addPendingTag}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-2"
                  >
                    <HiOutlinePlus className="h-4 w-4" aria-hidden />
                    {t("quickAdd", { name: searchQuery })}
                  </Button>
                  <div className="mt-3 border-t border-(--border) pt-3">
                    <p className="mb-2 text-xs text-(--muted)">
                      {t("createWithColorDescription")}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <TagColorPicker
                        disabled={isBusy}
                        value={newTagColor}
                        onChange={setNewTagColor}
                        getColorLabel={(color) => t(`colors.${color}`)}
                        label={t("colorLabel")}
                      />
                      <Button
                        disabled={isBusy || Boolean(validationError)}
                        onClick={() => void createColoredTag()}
                        variant="secondarySurface"
                        size="sm"
                        className="shrink-0"
                      >
                        {isTagActionPending
                          ? t("creating")
                          : t("createWithColor")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {actionError ? (
                <p className="mt-3 text-sm text-(--danger-text)" role="alert">
                  {actionError}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {!isLoading && !isQueryError ? (
          <footer className="flex items-center justify-between gap-2 border-t border-(--border) px-5 py-4">
            {view === "clip" ? (
              <Button
                disabled={isBusy}
                onClick={() => setView("manage")}
                variant="ghost"
                size="sm"
              >
                <HiOutlineCog className="h-4 w-4" aria-hidden />
                {t("manage")}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                disabled={isBusy}
                onClick={close}
                variant="secondary"
                size="sm"
              >
                {t("cancel")}
              </Button>
              {view === "clip" && clip ? (
                <Button
                  disabled={isBusy}
                  onClick={() => void saveClipTags()}
                  variant="primary"
                  size="sm"
                >
                  {isSavingClipTags ? t("saving") : t("save")}
                </Button>
              ) : null}
            </div>
          </footer>
        ) : null}
      </section>
    </Modal>
  );
}
