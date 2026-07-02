"use client";

import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";

interface StyledSelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly StyledSelectOption[];
  className?: string;
  disabled?: boolean;
}

export function StyledSelect({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
}: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || rootRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
        className="text-foreground flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-(--border) bg-(--surface) px-4 text-sm font-medium transition-colors hover:bg-(--surface-muted) disabled:cursor-default"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <HiChevronDown
          className={`h-4 w-4 shrink-0 text-(--muted) transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-full overflow-hidden rounded-2xl border border-(--border) bg-(--surface-elevated) shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
          <ul role="listbox">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition-colors duration-150 ease-out disabled:cursor-default motion-reduce:transition-none ${
                      isSelected
                        ? "bg-(--dropdown-option-hover) text-(--foreground)"
                        : "text-(--muted) hover:bg-(--dropdown-option-hover) hover:text-(--foreground)"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate font-medium">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
