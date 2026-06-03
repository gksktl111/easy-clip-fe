import { Clip } from "@/domains/clips/model/clip";
import { StoredClip } from "@/domains/clips/model/clipStorage";

export const mapStoredClipDates = (clip: StoredClip): Clip => ({
  ...clip,
  createdAt: new Date(clip.createdAt),
  updatedAt: clip.updatedAt ? new Date(clip.updatedAt) : undefined,
  lastCopiedAt: clip.lastCopiedAt ? new Date(clip.lastCopiedAt) : null,
});
