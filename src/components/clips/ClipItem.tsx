"use client";

import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineStar,
  HiStar,
} from "react-icons/hi";
import { Clip } from "../../types/clip";
import Image from "next/image";

interface ClipItemProps {
  clip: Clip;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => void;
}

export function ClipItem({
  clip,
  onCopy,
  onToggleFavorite,
  onContextMenu,
}: ClipItemProps) {
  const getIcon = () => {
    switch (clip.type) {
      case "text":
        return <HiOutlineDocumentText className="h-5 w-5" aria-hidden />;
      case "color":
        return <HiOutlineColorSwatch className="h-5 w-5" aria-hidden />;
      case "image":
        return <HiOutlinePhotograph className="h-5 w-5" aria-hidden />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (clip.type === "color") {
      return (
        <div
          className="h-full w-full rounded-xl border border-gray-200"
          style={{ backgroundColor: clip.content }}
          aria-hidden
        />
      );
    }

    if (clip.type === "image") {
      return (
        <div className="relative h-full w-full rounded-xl">
          <Image
            src={clip.content}
            alt={clip.name}
            fill
            sizes="(min-width: 1200px) 18vw, (min-width: 1024px) 22vw, (min-width: 768px) 28vw, 90vw"
            className="rounded-xl object-contain"
          />
        </div>
      );
    }

    return (
      <p className="line-clamp-4 text-sm leading-relaxed text-gray-700">
        {clip.content}
      </p>
    );
  };

  return (
    <div
      className="group relative flex h-52 w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={(event) => onCopy?.(clip, event)}
      onContextMenu={(event) => onContextMenu?.(event, clip)}
      role="button"
      tabIndex={0}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite?.(clip);
        }}
        className="absolute top-3 right-3 z-10 cursor-pointer rounded-full bg-white/90 p-1 text-gray-400 shadow-sm transition hover:text-amber-500"
        aria-label="Toggle favorite"
      >
        {clip.isFavorite ? (
          <HiStar className="h-4 w-4 text-amber-400" aria-hidden />
        ) : (
          <HiOutlineStar className="h-4 w-4" aria-hidden />
        )}
      </button>
      <div className="flex-1 overflow-hidden px-4 py-3">{renderContent()}</div>
      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-gray-500">
          {getIcon()}
        </span>
        <span className="truncate font-medium text-gray-700">
          {clip.type === "color" ? clip.content : clip.name}
        </span>
      </div>
    </div>
  );
}
