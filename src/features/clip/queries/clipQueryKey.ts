import type { FetchClipsQueryDto } from "@/features/clip/model/clip.dto";

export interface ClipQueryOptions {
  folderId?: string | null;
  favorite?: boolean;
  q?: string;
  recent?: boolean;
  type?: FetchClipsQueryDto["type"];
}

export const clipQueryKeys = {
  all: ["clips"] as const,
  list: (options: ClipQueryOptions = {}) =>
    [
      "clips",
      {
        folderId: options.folderId ?? null,
        favorite: Boolean(options.favorite),
        recent: Boolean(options.recent),
        type: options.type ?? "ALL",
        q: options.q?.trim() ?? "",
      },
    ] as const,
};
