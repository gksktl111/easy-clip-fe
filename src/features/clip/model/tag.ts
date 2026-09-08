export const TAG_BACKGROUND_COLORS = [
  "GRAY",
  "BROWN",
  "ORANGE",
  "YELLOW",
  "GREEN",
  "BLUE",
  "PURPLE",
  "PINK",
  "RED",
] as const;

export type TagBackgroundColor = (typeof TAG_BACKGROUND_COLORS)[number];

export interface ClipTag {
  id: string;
  name: string;
  backgroundColor: TagBackgroundColor;
}

export interface FolderTag extends ClipTag {
  folderId: string;
}
