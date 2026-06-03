"use client";

import { CLIP_EVENT } from "@/features/clip/service/clipStorage";

export const subscribeToClipStore = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(CLIP_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CLIP_EVENT, handler);
  };
};
