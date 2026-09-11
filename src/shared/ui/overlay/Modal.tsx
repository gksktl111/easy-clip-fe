"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isOpen?: boolean;
  overlay?: "default" | "strong";
  ariaLabel?: string;
  labelledBy?: string;
  onClose?: () => void;
  onEscape?: () => void;
}

const modalStack: HTMLElement[] = [];
const previousInert = new Map<HTMLElement, boolean>();
let previousOverflow = "";
const focusableSelector =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
const notificationSelector = "[data-modal-notification-root]";

// 알림의 닫기와 Alt+T 접근은 유지하며 최상위 모달 이외의 화면을 비활성화합니다.
function syncBackground() {
  const top = modalStack.at(-1);
  if (!top) {
    previousInert.forEach((inert, element) => {
      element.inert = inert;
    });
    previousInert.clear();
    document.body.style.overflow = previousOverflow;
    return;
  }
  for (const element of document.body.children) {
    if (!(element instanceof HTMLElement)) continue;
    if (!previousInert.has(element)) previousInert.set(element, element.inert);
    const isNotification =
      element.matches(notificationSelector) ||
      Boolean(element.querySelector(notificationSelector));
    element.inert =
      Boolean(previousInert.get(element)) ||
      (element !== top && !isNotification);
  }
}

function OpenModal({
  children,
  className = "",
  contentClassName = "",
  overlay = "default",
  ariaLabel,
  labelledBy,
  onClose,
  onEscape,
}: ModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!modalStack.length) previousOverflow = document.body.style.overflow;
    modalStack.push(root);
    document.body.style.overflow = "hidden";
    syncBackground();
    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0 &&
          !element.closest("[inert]"),
      );
    const focusFirst = () => (focusables()[0] ?? root).focus();
    if (!root.contains(document.activeElement)) focusFirst();
    const onFocus = (event: FocusEvent) => {
      if (
        modalStack.at(-1) !== root ||
        !(event.target instanceof Element) ||
        event.target.closest(notificationSelector)
      )
        return;
      if (!root.contains(event.target)) focusFirst();
    };
    const onTab = (event: KeyboardEvent) => {
      if (
        event.key !== "Tab" ||
        modalStack.at(-1) !== root ||
        (event.target instanceof Element &&
          event.target.closest(notificationSelector))
      )
        return;
      const elements = focusables();
      const first = elements[0] ?? root;
      const last = elements.at(-1) ?? root;
      if (
        !root.contains(document.activeElement) ||
        document.activeElement === root ||
        (event.shiftKey
          ? document.activeElement === first
          : document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    const observer = new MutationObserver(syncBackground);
    observer.observe(document.body, { childList: true });
    document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onTab);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("keydown", onTab);
      modalStack.splice(modalStack.indexOf(root), 1);
      syncBackground();
      if (returnFocus?.isConnected && !returnFocus.closest("[inert]"))
        returnFocus.focus();
    };
  }, [returnFocus]);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${overlay === "strong" ? "bg-(--overlay-strong)" : "bg-(--overlay)"} ${className}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !event.nativeEvent.isComposing &&
          modalStack.at(-1) === event.currentTarget
        ) {
          event.stopPropagation();
          (onEscape ?? onClose)?.();
        }
      }}
    >
      <div className={contentClassName}>{children}</div>
    </div>,
    document.body,
  );
}

export function Modal({ isOpen = true, ...props }: ModalProps) {
  if (!isOpen || typeof document === "undefined") return null;
  return <OpenModal {...props} />;
}
