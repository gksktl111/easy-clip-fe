import { Clip } from "@/features/clip/model/clip";
import { StoredClip } from "@/features/clip/service/clipStorage";

export const mapStoredClipDates = (clip: StoredClip): Clip => ({
  ...clip,
  createdAt: new Date(clip.createdAt),
  updatedAt: clip.updatedAt ? new Date(clip.updatedAt) : undefined,
  lastCopiedAt: clip.lastCopiedAt ? new Date(clip.lastCopiedAt) : null,
});
