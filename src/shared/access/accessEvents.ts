// 권한 재확인 신호와 이전 권한에서 시작한 응답을 식별하는 클라이언트 세대입니다.
const ACCESS_REFRESH_EVENT = "resource-access:refresh";
let generation = 0;

export const getAccessGeneration = () => generation;
export const advanceAccessGeneration = () => ++generation;

export class AccessChangedError extends Error {
  constructor() {
    super("RESOURCE_ACCESS_CHANGED");
    this.name = "AccessChangedError";
  }
}

export type AccessRefreshReason = "policy" | "mutation";

export const requestAccessRefresh = (
  reason: AccessRefreshReason = "mutation",
) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ACCESS_REFRESH_EVENT, { detail: reason }),
    );
  }
};

export const subscribeToAccessRefresh = (
  listener: (reason: AccessRefreshReason) => void,
) => {
  const handler = (event: Event) =>
    listener((event as CustomEvent<AccessRefreshReason>).detail);
  window.addEventListener(ACCESS_REFRESH_EVENT, handler);
  return () => window.removeEventListener(ACCESS_REFRESH_EVENT, handler);
};
