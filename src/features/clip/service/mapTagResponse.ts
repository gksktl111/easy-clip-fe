import type { ClipTag, FolderTag } from "@/features/clip/model/tag";
import type {
  ClipTagResponseDto,
  FolderTagResponseDto,
} from "@/features/clip/model/tag.dto";

export const mapClipTagResponse = (tag: ClipTagResponseDto): ClipTag => ({
  id: tag.id,
  name: tag.name,
  backgroundColor: tag.backgroundColor,
});

export const mapFolderTagResponse = (tag: FolderTagResponseDto): FolderTag => ({
  ...mapClipTagResponse(tag),
  folderId: tag.folderId,
});
