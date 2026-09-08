import { create } from "zustand";

export type CaptureInput =
  | { type: "text"; text: string }
  | { type: "image"; file: File };
export interface CaptureDraft {
  id: string;
  input: CaptureInput;
  error?: unknown;
}

interface CaptureDraftStore {
  ownerId: string | null;
  drafts: Record<string, CaptureDraft>;
  save: (ownerId: string, folderId: string, draft: CaptureDraft) => void;
  fail: (ownerId: string, folderId: string, id: string, error: unknown) => void;
  remove: (ownerId: string, folderId: string, id: string) => void;
}

// 미저장 사용자 입력만 메모리에 보관합니다. 서버 콘텐츠나 파일을 영구 저장하지 않습니다.
export const useCaptureDraftStore = create<CaptureDraftStore>((set) => ({
  ownerId: null,
  drafts: {},
  save: (ownerId, folderId, draft) =>
    set((state) => ({
      ownerId,
      drafts: {
        ...(state.ownerId === ownerId ? state.drafts : {}),
        [folderId]: draft,
      },
    })),
  fail: (ownerId, folderId, id, error) =>
    set((state) =>
      state.ownerId === ownerId && state.drafts[folderId]?.id === id
        ? {
            drafts: {
              ...state.drafts,
              [folderId]: { ...state.drafts[folderId], error },
            },
          }
        : state,
    ),
  remove: (ownerId, folderId, id) =>
    set((state) => {
      if (state.ownerId !== ownerId || state.drafts[folderId]?.id !== id)
        return state;
      const drafts = { ...state.drafts };
      delete drafts[folderId];
      return { drafts };
    }),
}));
