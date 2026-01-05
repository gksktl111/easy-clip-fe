"use client";

import {
  HiOutlineArrowsExpand,
  HiOutlineMinus,
  HiOutlineX,
} from "react-icons/hi";

export function TitleBar() {
  return (
    <header className="flex h-11 items-center justify-between bg-slate-900 px-4 text-xs text-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="text-sm font-semibold">Clipboard Studio (Web)</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Minimize (desktop only)"
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-700"
        >
          <HiOutlineMinus className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Toggle size (desktop only)"
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-700"
        >
          <HiOutlineArrowsExpand className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Close (desktop only)"
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-red-600"
        >
          <HiOutlineX className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
