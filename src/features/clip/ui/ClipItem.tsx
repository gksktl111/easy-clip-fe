"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  HiCheck,
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineStar,
  HiStar,
} from "react-icons/hi";
import type { Clip } from "@/features/clip/model/clip";

// 클립 하나의 미리보기, 유형 정보, 복사, 즐겨찾기와 삭제 선택 상태를 표시합니다.
interface ClipItemProps {
  clip: Clip;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (
    event: React.MouseEvent<HTMLButtonElement>,
    clip: Clip,
  ) => void;
  isDeleteMode?: boolean;
  isInteractionDisabled?: boolean;
  isSelected?: boolean;
  onToggleSelected?: (clipId: string) => void;
}

function ClipTypeIcon({ type }: { type: Clip["type"] }) {
  switch (type) {
    case "text":
      return <HiOutlineDocumentText className="h-5 w-5" aria-hidden />;
    case "color":
      return <HiOutlineColorSwatch className="h-5 w-5" aria-hidden />;
    case "image":
      return <HiOutlinePhotograph className="h-5 w-5" aria-hidden />;
    default:
      return null;
  }
}

function ClipContentPreview({
  clip,
  isOptimistic,
}: {
  clip: Clip;
  isOptimistic: boolean;
}) {
  if (clip.type === "color") {
    return (
      <span
        className="block h-full w-full rounded-xl border border-(--border)"
        style={{ backgroundColor: clip.content }}
        aria-hidden
      />
    );
  }

  if (clip.type === "image") {
    return (
      <span
        className="relative block h-full w-full rounded-xl bg-(--surface-muted)"
        style={
          isOptimistic && clip.content
            ? {
                backgroundImage: `url(${clip.content})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
              }
            : undefined
        }
      >
        {isOptimistic ? null : (
          <Image
            src={clip.content}
            alt={clip.name}
            fill
            sizes="(min-width: 1200px) 18vw, (min-width: 1024px) 22vw, (min-width: 768px) 28vw, 90vw"
            className="rounded-xl object-contain"
          />
        )}
      </span>
    );
  }

  return (
    <span className="text-foreground line-clamp-4 text-sm leading-relaxed">
      {clip.content}
    </span>
  );
}

export function ClipItem({
  clip,
  onCopy,
  onToggleFavorite,
  onContextMenu,
  isDeleteMode = false,
  isInteractionDisabled = false,
  isSelected = false,
  onToggleSelected,
}: ClipItemProps) {
  const t = useTranslations("clips.item");
  const isOptimistic = Boolean(clip.isOptimistic);
  const isDisabled = isOptimistic || isInteractionDisabled;
  const primaryActionLabel = isDeleteMode
    ? t("selectForDelete", { name: clip.name })
    : t("copy", { name: clip.name });

  return (
    <article
      className="group relative h-52 w-full overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-sm transition-shadow hover:shadow-md data-[disabled=true]:opacity-75 data-[selected=true]:border-(--danger) data-[selected=true]:ring-2 data-[selected=true]:ring-(--danger-border)"
      data-optimistic={isOptimistic}
      data-disabled={isDisabled}
      data-delete-mode={isDeleteMode}
      data-selected={isSelected}
    >
      <button
        type="button"
        disabled={isDisabled}
        aria-label={primaryActionLabel}
        aria-pressed={isDeleteMode ? isSelected : undefined}
        onClick={(event) => {
          if (isDeleteMode) {
            onToggleSelected?.(clip.id);
            return;
          }

          onCopy?.(clip, event);
        }}
        onContextMenu={(event) => {
          if (isDeleteMode) {
            event.preventDefault();
            return;
          }

          onContextMenu?.(event, clip);
        }}
        className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-wait"
      >
        <span className="flex-1 overflow-hidden px-4 py-3">
          <ClipContentPreview clip={clip} isOptimistic={isOptimistic} />
        </span>
        <span className="flex items-center gap-2 border-t border-(--border) px-4 py-2.5 text-xs text-(--muted)">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--icon-chip) text-(--icon-chip-text)">
            <ClipTypeIcon type={clip.type} />
          </span>
          <span className="text-foreground truncate font-medium">
            {clip.type === "color" ? clip.content : clip.name}
          </span>
        </span>
      </button>
      {isDeleteMode ? (
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            disabled={isDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelected?.(clip.id);
            }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-150 ease-out disabled:cursor-default disabled:opacity-50 ${
              isSelected
                ? "text-danger-foreground border-(--danger) bg-(--danger)"
                : "border-(--border) bg-(--surface-elevated) text-transparent hover:border-(--danger-border) hover:text-(--danger)"
            }`}
            aria-pressed={isSelected}
            aria-label={t("selectForDelete", { name: clip.name })}
          >
            <HiCheck className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
      {isOptimistic ? (
        <div className="absolute inset-x-3 top-3 z-20 flex justify-start">
          <span className="rounded-full bg-(--primary) px-2.5 py-1 text-[11px] font-semibold text-(--primary-foreground) shadow-sm">
            {t("saving")}
          </span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (!isDisabled && !isDeleteMode) {
            onToggleFavorite?.(clip);
          }
        }}
        disabled={isDisabled || isDeleteMode}
        className="absolute top-3 right-3 z-10 cursor-pointer rounded-full bg-(--favorite-btn-bg) p-1.5 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-(--favorite-btn-bg-hover) disabled:cursor-wait disabled:opacity-50"
        style={{ boxShadow: "var(--favorite-btn-shadow)" }}
        aria-label={t("toggleFavorite")}
      >
        {clip.isFavorite ? (
          <HiStar className="h-4 w-4 text-(--warning)" aria-hidden />
        ) : (
          <HiOutlineStar
            className="h-4 w-4 text-(--favorite-icon-muted)"
            aria-hidden
          />
        )}
      </button>
    </article>
  );
}
