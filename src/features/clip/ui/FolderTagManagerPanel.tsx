"use client";

import { notifyError, notifySuccess } from "@/shared/feedback/toast";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import type { FolderTag, TagBackgroundColor } from "@/features/clip/model/tag";
import {
  getTagNameLength,
  getTagNameValidationError,
} from "@/features/clip/service/tagNameValidation";
import { TagChip } from "@/features/clip/ui/TagChip";
import { TagColorPicker } from "@/features/clip/ui/TagColorPicker";
import { ApiError } from "@/shared/lib/apiClient";
import { Button } from "@/shared/ui/button/Button";
import { TextInput } from "@/shared/ui/input/TextInput";
import { ConfirmActionModal } from "@/shared/ui/overlay/ConfirmActionModal";

type TagFormState =
  | { mode: "create"; name: string; backgroundColor: TagBackgroundColor }
  | {
      mode: "edit";
      tag: FolderTag;
      name: string;
      backgroundColor: TagBackgroundColor;
    };

interface FolderTagManagerPanelProps {
  isPending: boolean;
  onCreate: (
    name: string,
    backgroundColor?: TagBackgroundColor,
  ) => Promise<FolderTag>;
  onDelete: (tag: FolderTag) => Promise<unknown>;
  onDeleted?: (tag: FolderTag) => void;
  onRename?: (previousName: string, tag: FolderTag) => void;
  onUpdate: (
    tagId: string,
    payload: { name?: string; backgroundColor?: TagBackgroundColor },
  ) => Promise<FolderTag>;
  tags: FolderTag[];
}

export function FolderTagManagerPanel({
  isPending,
  onCreate,
  onDelete,
  onDeleted,
  onRename,
  onUpdate,
  tags,
}: FolderTagManagerPanelProps) {
  const submitting = useRef(false);
  const feedback = useTranslations("feedback");
  const t = useTranslations("clips.tags");
  const [form, setForm] = useState<TagFormState | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FolderTag | null>(null);

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

  const updateFormName = (name: string) => {
    setFieldError(null);
    setForm((current) => (current ? { ...current, name } : current));
  };

  const updateFormColor = (backgroundColor: TagBackgroundColor) => {
    setForm((current) => (current ? { ...current, backgroundColor } : current));
  };

  const closeForm = () => {
    setForm(null);
    setFieldError(null);
  };

  const handleNestedEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || (!form && !deleteTarget)) {
      return;
    }

    event.stopPropagation();
    if (isPending) {
      return;
    }

    if (deleteTarget) {
      setDeleteTarget(null);
    } else {
      closeForm();
    }
  };

  const submitForm = async () => {
    if (!form || isPending || submitting.current) {
      return;
    }

    const validationError = getTagNameValidationError(form.name);
    if (validationError) {
      setFieldError(t(`validation.${validationError}`));
      return;
    }

    setFieldError(null);

    submitting.current = true;
    try {
      if (form.mode === "create") {
        await onCreate(form.name, form.backgroundColor);
        notifySuccess(feedback("tagCreated"));
      } else {
        const payload: {
          name?: string;
          backgroundColor?: TagBackgroundColor;
        } = {};

        if (form.name !== form.tag.name) {
          payload.name = form.name;
        }
        if (form.backgroundColor !== form.tag.backgroundColor) {
          payload.backgroundColor = form.backgroundColor;
        }

        if (Object.keys(payload).length === 0) {
          closeForm();
          return;
        }

        const updatedTag = await onUpdate(form.tag.id, payload);
        onRename?.(form.tag.name, updatedTag);
        notifySuccess(feedback("tagUpdated"));
      }

      closeForm();
    } catch (error) {
      const message = getRequestErrorMessage(error);
      setFieldError(
        error instanceof ApiError && [400, 409].includes(error.status)
          ? message
          : null,
      );
      if (!(error instanceof ApiError && [400, 409].includes(error.status)))
        notifyError(message);
    } finally {
      submitting.current = false;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isPending || submitting.current) {
      return;
    }

    const target = deleteTarget;

    submitting.current = true;
    try {
      await onDelete(target);
      notifySuccess(feedback("tagDeleted"));
      setDeleteTarget(null);
      onDeleted?.(target);
    } catch (error) {
      setDeleteTarget(null);
      notifyError(getRequestErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  };

  if (form) {
    return (
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submitForm();
        }}
        onKeyDown={handleNestedEscape}
      >
        <div>
          <label
            htmlFor="folder-tag-name"
            className="text-xs font-semibold text-(--muted)"
          >
            {t("nameLabel")}
          </label>
          <TextInput
            id="folder-tag-name"
            autoFocus
            value={form.name}
            onChange={(event) => updateFormName(event.target.value)}
            inputClassName="mt-2 rounded-lg px-3 py-2 focus:ring-0"
            placeholder={t("namePlaceholder")}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "folder-tag-name-error" : undefined}
          />
          <div className="mt-1 flex items-start justify-between gap-3 text-xs">
            <span id="folder-tag-name-error" className="text-(--danger-text)">
              {fieldError}
            </span>
            <span className="shrink-0 text-(--muted)">
              {getTagNameLength(form.name)}/10
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-(--muted)">
            {t("colorLabel")}
          </p>
          <TagColorPicker
            disabled={isPending}
            value={form.backgroundColor}
            onChange={updateFormColor}
            getColorLabel={(color) => t(`colors.${color}`)}
            label={t("colorLabel")}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
          <Button
            disabled={isPending}
            onClick={closeForm}
            variant="secondary"
            size="sm"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            variant="primary"
            size="sm"
          >
            {isPending
              ? t("saving")
              : form.mode === "create"
                ? t("create")
                : t("save")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div onKeyDown={handleNestedEscape}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-(--muted)">{t("manageDescription")}</p>
        <Button
          disabled={isPending}
          onClick={() => {
            setForm({ mode: "create", name: "", backgroundColor: "GRAY" });
          }}
          variant="secondarySurface"
          size="sm"
          className="shrink-0"
        >
          <HiOutlinePlus className="h-4 w-4" aria-hidden />
          {t("newTag")}
        </Button>
      </div>

      {tags.length ? (
        <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-(--surface-muted)"
            >
              <TagChip name={tag.name} backgroundColor={tag.backgroundColor} />
              <span className="min-w-0 flex-1 truncate text-xs text-(--muted)">
                {t(`colors.${tag.backgroundColor}`)}
              </span>
              <Button
                disabled={isPending}
                onClick={() => {
                  setForm({
                    mode: "edit",
                    tag,
                    name: tag.name,
                    backgroundColor: tag.backgroundColor,
                  });
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("editTag", { name: tag.name })}
              >
                <HiOutlinePencil className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                disabled={isPending}
                onClick={() => setDeleteTarget(tag)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-(--danger-text)"
                aria-label={t("deleteTag", { name: tag.name })}
              >
                <HiOutlineTrash className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-(--surface-muted) px-4 py-6 text-center text-sm text-(--muted)">
          {t("empty")}
        </p>
      )}

      <ConfirmActionModal
        isOpen={Boolean(deleteTarget)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription", {
          name: deleteTarget?.name ?? "",
        })}
        cancelLabel={t("cancel")}
        confirmLabel={isPending ? t("deleting") : t("delete")}
        isConfirming={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
