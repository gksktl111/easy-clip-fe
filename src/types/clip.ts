export type ClipType = "text" | "color" | "image";

export interface Clip {
  id: string;
  type: ClipType;
  content: string;
  createdAt: Date;
  isFavorite?: boolean;
}
