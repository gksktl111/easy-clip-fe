import { describe, expect, it } from "vitest";
import { getClipNameLength, isValidClipName } from "./clipNameValidation";

describe("클립 이름 제한", () => {
  it("앞뒤 공백을 제외하고 1~15자를 허용한다", () => {
    expect(isValidClipName(" \t\n ")).toBe(false);
    expect(isValidClipName(" 가 ")).toBe(true);
    expect(isValidClipName(`  ${"가".repeat(15)}  `)).toBe(true);
    expect(isValidClipName("가".repeat(16))).toBe(false);
  });
  it("이름 내부 공백과 유니코드 코드 포인트를 센다", () => {
    expect(getClipNameLength("  가 나  ")).toBe(3);
    expect(getClipNameLength("😀".repeat(15))).toBe(15);
    expect(isValidClipName("😀".repeat(16))).toBe(false);
  });
});
