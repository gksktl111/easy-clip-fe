import { describe, expect, it } from "vitest";
import {
  getTagNameLength,
  getTagNameValidationError,
  getUniqueTagNames,
} from "@/features/clip/service/tagNameValidation";

describe("태그 이름 검증", () => {
  it("공백만 있는 이름과 10자를 넘는 이름을 구분한다", () => {
    expect(getTagNameValidationError("   ")).toBe("required");
    expect(getTagNameValidationError("12345678901")).toBe("tooLong");
    expect(getTagNameValidationError(" 태그 이름 ")).toBeNull();
  });

  it("대소문자와 앞뒤 공백을 유지한 채 정확히 같은 이름만 중복 제거한다", () => {
    expect(getUniqueTagNames(["Tag", "tag", " Tag", "Tag"])).toEqual([
      "Tag",
      "tag",
      " Tag",
    ]);
  });

  it("이모지를 사용자에게 보이는 한 글자로 계산한다", () => {
    expect(getTagNameLength("😀태그")).toBe(3);
  });
});
