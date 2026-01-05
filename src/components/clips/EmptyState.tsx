"use client";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <span className="text-4xl font-bold text-gray-400">T</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          No clips yet
        </h2>
        <p className="mb-8 text-sm text-gray-500">
          Click anywhere and press Ctrl+V to capture a new clip
        </p>
      </div>
    </div>
  );
}
