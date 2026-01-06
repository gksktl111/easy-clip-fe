"use client";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-muted)]">
          <span className="text-4xl font-bold text-[var(--muted)]">T</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
          No clips yet
        </h2>
        <p className="mb-8 text-sm text-[var(--muted)]">
          Click anywhere and press Ctrl+V to capture a new clip
        </p>
      </div>
    </div>
  );
}
