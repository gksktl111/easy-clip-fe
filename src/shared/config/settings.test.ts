import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, isThemeMode } from "@/shared/config/settings";

describe("isThemeMode", () => {
  it("지원하는 테마 값만 true를 반환한다", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
  });

  it("기본 테마는 지원하는 테마 값이다", () => {
    expect(isThemeMode(DEFAULT_THEME)).toBe(true);
  });
});
