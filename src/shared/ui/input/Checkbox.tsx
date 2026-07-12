import type { InputHTMLAttributes } from "react";

// 공통 체크박스 입력의 크기, 색상, 비활성 상태 스타일을 제공합니다.
type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className = "", ...props }: CheckboxProps) {
  return (
    <input
      {...props}
      type="checkbox"
      className={`h-4 w-4 cursor-pointer rounded border-(--border) accent-(--primary) disabled:cursor-default ${className}`}
    />
  );
}
