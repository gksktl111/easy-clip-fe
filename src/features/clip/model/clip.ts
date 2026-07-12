export type ClipType = "text" | "color" | "image";
export type ClipFilter = ClipType | "all";

export interface Clip {
  id: string;
  folderId?: string | null;
  type: ClipType;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  lastCopiedAt?: Date | null;
  isFavorite?: boolean;
  isOptimistic?: boolean;
}
