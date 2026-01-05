export type ClipType = "text" | "color" | "image";

export interface Clip {
  id: string;
  type: ClipType;
  name: string;
  content: string;
  createdAt: Date;
  isFavorite?: boolean;
}
