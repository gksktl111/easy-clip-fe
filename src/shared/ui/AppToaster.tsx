"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton={false}
      duration={3000}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "bg-transparent p-0 shadow-none",
        },
      }}
    />
  );
}
