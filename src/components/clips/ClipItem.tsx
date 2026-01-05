"use client";

import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
} from "react-icons/hi";
import { Clip } from "../../types/clip";

interface ClipItemProps {
  clip: Clip;
}

export function ClipItem({ clip }: ClipItemProps) {
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

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{clip.content}</p>
        </div>
        <p className="text-xs text-gray-500">{formatDate(clip.createdAt)}</p>
      </div>
    </div>
  );
}
