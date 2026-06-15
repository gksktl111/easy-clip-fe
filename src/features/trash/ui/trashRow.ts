export type TrashItemRow =
  | {
      kind: "folder";
      id: string;
      name: string;
      deletedAt: string | null;
      typeLabel: string;
    }
  | {
      kind: "clip";
      id: string;
      name: string;
      deletedAt: string | null;
      typeLabel: string;
      clipType: "TEXT" | "COLOR" | "IMAGE";
      parentFolderName: string;
    };

export const formatDeletedAt = (deletedAt: string | null) => {
  if (!deletedAt) {
    return "-";
  }

  const date = new Date(deletedAt);
  return Number.isNaN(date.getTime()) ? deletedAt : date.toLocaleString();
};
