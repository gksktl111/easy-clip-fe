import type { ButtonHTMLAttributes } from "react";

// 켜짐/꺼짐 상태를 전환하는 공통 스위치 입력입니다.
interface SwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export function Switch({
  checked,
  className = "",
  type = "button",
  ...props
}: SwitchProps) {
  return (
    <button
      type={type}
      className={`relative h-7 w-12 cursor-pointer rounded-full transition disabled:cursor-default disabled:opacity-50 ${
        checked ? "bg-(--primary)" : "bg-(--border)"
      } ${className}`}
      aria-pressed={checked}
      {...props}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-0.5"
        }`}
      />
    </button>
  );
}
