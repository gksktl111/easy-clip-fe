export interface FolderItem {
  id: string;
  name: string;
  order: number;
  // 목록 계약 누락은 접근 허용으로 해석하지 않습니다.
  isLocked?: boolean;
}

export type FolderDropPosition = "before" | "after";
