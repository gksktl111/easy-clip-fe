const STORAGE_KEY = "easy_clip_logout_requested";
const CHANGE_EVENT = "auth-session:logout-intent";
let memoryIntent = false;

// 쿠키를 지울 수 없는 실패 상황에서도 같은 탭의 새로고침으로 자료를 다시 열지 않습니다.
export function getLogoutIntent() {
  try {
    return (
      window.sessionStorage.getItem(STORAGE_KEY) === "true" || memoryIntent
    );
  } catch {
    return memoryIntent;
  }
}

export function setLogoutIntent(requested: boolean) {
  memoryIntent = requested;
  try {
    if (requested) window.sessionStorage.setItem(STORAGE_KEY, "true");
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소가 막힌 브라우저에서는 현재 문서의 메모리 상태로 보호합니다.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeLogoutIntent(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export const getServerLogoutIntent = () => false;
