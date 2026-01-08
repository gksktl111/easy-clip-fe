"use client";

import { Clip } from "../types/clip";

export interface StoredClip extends Omit<
  Clip,
  "createdAt" | "updatedAt" | "lastCopiedAt"
> {
  createdAt: string;
  updatedAt: string;
  lastCopiedAt: string | null;
}

export const CLIP_STORAGE_KEY = "easy-clip-clips";
export const CLIP_EVENT = "clips:change";
export const MAX_RECENT_CLIPS = 50;

const LEGACY_FOLDER_KEY = "easy-clip-folder-clips";
const LEGACY_RECENT_KEY = "easy-clip-recent-clips";

const parseStoredClips = (stored: string | null): StoredClip[] => {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as StoredClip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const pruneRecent = (clips: StoredClip[]) => {
  const recent = clips
    .filter((clip) => clip.lastCopiedAt)
    .sort((a, b) => (b.lastCopiedAt ?? "").localeCompare(a.lastCopiedAt ?? ""));
  const allowed = new Set(
    recent.slice(0, MAX_RECENT_CLIPS).map((clip) => clip.id),
  );
  return clips.map((clip) =>
    clip.lastCopiedAt && !allowed.has(clip.id)
      ? { ...clip, lastCopiedAt: null }
      : clip,
  );
};

const writeStoredClips = (clips: StoredClip[]) => {
  const pruned = pruneRecent(clips);
  localStorage.setItem(CLIP_STORAGE_KEY, JSON.stringify(pruned));
  window.dispatchEvent(new Event(CLIP_EVENT));
};

const migrateLegacy = (): StoredClip[] => {
  const legacyFolderRaw = localStorage.getItem(LEGACY_FOLDER_KEY);
  const legacyRecentRaw = localStorage.getItem(LEGACY_RECENT_KEY);
  if (!legacyFolderRaw && !legacyRecentRaw) return [];

  const now = new Date().toISOString();
  const map = new Map<string, StoredClip>();

  if (legacyFolderRaw) {
    try {
      const parsed = JSON.parse(legacyFolderRaw) as Record<
        string,
        StoredClip[]
      >;
      Object.entries(parsed ?? {}).forEach(([folderId, clips]) => {
        if (!Array.isArray(clips)) return;
        clips.forEach((clip) => {
          map.set(clip.id, {
            ...clip,
            folderId,
            updatedAt: clip.createdAt ?? now,
            lastCopiedAt: null,
          });
        });
      });
    } catch {
      // ignore legacy parse errors
    }
  }

  if (legacyRecentRaw) {
    try {
      const parsed = JSON.parse(legacyRecentRaw) as StoredClip[];
      if (Array.isArray(parsed)) {
        parsed.forEach((clip) => {
          const existing = map.get(clip.id);
          const lastCopiedAt = clip.createdAt ?? now;
          if (existing) {
            map.set(clip.id, { ...existing, lastCopiedAt });
          } else {
            map.set(clip.id, {
              ...clip,
              folderId: null,
              updatedAt: clip.createdAt ?? now,
              lastCopiedAt,
            });
          }
        });
      }
    } catch {
      // ignore legacy parse errors
    }
  }

  return Array.from(map.values());
};

export const readStoredClips = (): StoredClip[] => {
  const stored = localStorage.getItem(CLIP_STORAGE_KEY);
  if (stored) return parseStoredClips(stored);
  const migrated = migrateLegacy();
  if (migrated.length) {
    writeStoredClips(migrated);
    return migrated;
  }
  return [];
};

export const getFolderClips = (folderId: string): StoredClip[] =>
  readStoredClips().filter((clip) => clip.folderId === folderId);

export const getFavoriteClips = (): StoredClip[] =>
  readStoredClips().filter((clip) => clip.isFavorite);

export const getRecentClips = (): StoredClip[] =>
  readStoredClips()
    .filter((clip) => clip.lastCopiedAt)
    .sort((a, b) => (b.lastCopiedAt ?? "").localeCompare(a.lastCopiedAt ?? ""))
    .slice(0, MAX_RECENT_CLIPS);

export const upsertClip = (clip: StoredClip) => {
  const stored = readStoredClips();
  const exists = stored.some((item) => item.id === clip.id);
  const next = exists
    ? stored.map((item) => (item.id === clip.id ? clip : item))
    : [clip, ...stored];
  writeStoredClips(next);
};

export const updateClip = (
  clipId: string,
  patch: Partial<
    Pick<
      StoredClip,
      "name" | "content" | "isFavorite" | "lastCopiedAt" | "updatedAt"
    >
  >,
) => {
  const stored = readStoredClips();
  const next = stored.map((clip) =>
    clip.id === clipId ? { ...clip, ...patch } : clip,
  );
  writeStoredClips(next);
};

export const deleteClip = (clipId: string) => {
  const stored = readStoredClips();
  writeStoredClips(stored.filter((clip) => clip.id !== clipId));
};

export const clearFolderClips = (folderId: string) => {
  const stored = readStoredClips();
  writeStoredClips(stored.filter((clip) => clip.folderId !== folderId));
};

export const clearRecentClips = () => {
  const stored = readStoredClips();
  writeStoredClips(
    stored.map((clip) =>
      clip.lastCopiedAt ? { ...clip, lastCopiedAt: null } : clip,
    ),
  );
};

export const recordCopy = (clipId: string) => {
  updateClip(clipId, {
    lastCopiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};
