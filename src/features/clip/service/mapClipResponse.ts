import { Clip, ClipType } from "@/features/clip/model/clip";
import { ClipListItemResponseDto } from "@/features/clip/model/clip.dto";

const clipTypeMap: Record<ClipListItemResponseDto["type"], ClipType> = {
  TEXT: "text",
  COLOR: "color",
  IMAGE: "image",
};

export const mapClipResponse = (clip: ClipListItemResponseDto): Clip => ({
  id: clip.id,
  folderId: clip.folderId,
  type: clipTypeMap[clip.type],
  name: clip.title,
  content: clip.textContent ?? clip.colorHex ?? clip.imageUrl ?? "",
  createdAt: new Date(clip.createdAt),
  updatedAt: new Date(clip.updatedAt),
  isFavorite: clip.likeByMe,
});
