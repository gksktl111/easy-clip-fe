import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

// 앱 전반에서 사용하는 텍스트 입력 스타일과 좌측 아이콘 영역을 제공합니다.
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  inputClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      className = "",
      inputClassName = "",
      leftIcon,
      type = "text",
      ...props
    },
    ref,
  ) {
    const input = (
      <input
        ref={ref}
        type={type}
        className={`text-foreground w-full rounded-xl border border-(--border) bg-(--input) px-4 py-3 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:ring-1 focus:ring-(--focus-ring) focus:outline-none disabled:cursor-default disabled:opacity-60 ${leftIcon ? "pl-10" : ""} ${inputClassName}`}
        {...props}
      />
    );

    if (!leftIcon) {
      return input;
    }

    return (
      <div className={`relative ${className}`}>
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-(--muted)">
          {leftIcon}
        </span>
        {input}
      </div>
    );
  },
);
