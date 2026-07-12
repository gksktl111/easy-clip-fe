"use client";

// 로그인 화면의 제목과 안내 문구를 일관된 정렬로 표시합니다.
interface LoginBrandPanelProps {
  title: string;
  subtitle: string;
}

export function LoginBrandPanel({ title, subtitle }: LoginBrandPanelProps) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <h1 className="text-xl font-semibold text-(--foreground)">{title}</h1>
      <p className="mt-2 text-center text-sm text-(--muted)">{subtitle}</p>
    </div>
  );
}
