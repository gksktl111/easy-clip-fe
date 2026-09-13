"use client";

import { useTranslations } from "next-intl";
import { Toaster } from "sonner";
import { TOAST_DURATION_MS } from "./toast";

export function AppToaster() {
  const t = useTranslations("feedback");
  return (
    <div data-modal-notification-root>
      <Toaster
        position="bottom-center"
        offset={{ bottom: 96 }}
        containerAriaLabel={t("region")}
        hotkey={["altKey", "KeyT"]}
        visibleToasts={3}
        mobileOffset={{ bottom: 96, left: 16, right: 16 }}
        closeButton={false}
        duration={TOAST_DURATION_MS}
        toastOptions={{
          classNames: { toast: "bg-transparent p-0 shadow-none" },
        }}
      />
    </div>
  );
}
