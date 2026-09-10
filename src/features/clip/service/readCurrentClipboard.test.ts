import { describe, expect, it, vi } from "vitest";
import { readCurrentClipboard } from "./readCurrentClipboard";

const item = (content: Record<string, Blob>): ClipboardItem => ({
  types: Object.keys(content),
  presentationStyle: "unspecified",
  getType: async (type) => content[type],
});

describe("버튼 클립보드 읽기", () => {
  it("read가 있으면 클릭 중 동기적으로 호출하고 텍스트를 반환한다", async () => {
    const read = vi
      .fn()
      .mockResolvedValue([item({ "text/plain": new Blob([" hello "]) })]);
    const result = readCurrentClipboard({ read });
    expect(read).toHaveBeenCalledOnce();
    expect(await result).toEqual({ kind: "text", text: "hello" });
  });
  it("이미지와 대체 텍스트가 함께 있으면 이미지를 한 번만 선택한다", async () => {
    const result = await readCurrentClipboard({
      read: async () => [
        item({
          "text/plain": new Blob(["alt"]),
          "image/png": new Blob(["png-bytes"], { type: "image/png" }),
        }),
      ],
    });
    expect(result.kind).toBe("image");
    if (result.kind !== "image") throw new Error("이미지 결과가 필요합니다");
    expect(result.file.type).toBe("image/png");
    expect(await result.file.text()).toBe("png-bytes");
  });
  it("readText만 지원하면 텍스트를 읽는다", async () => {
    expect(
      await readCurrentClipboard({ readText: async () => " text " }),
    ).toEqual({ kind: "text", text: "text" });
  });
  it("빈 내용과 미지원 형식을 구분한다", async () => {
    expect(await readCurrentClipboard({ read: async () => [] })).toEqual({
      kind: "empty",
    });
    expect(await readCurrentClipboard({ readText: async () => "  " })).toEqual({
      kind: "empty",
    });
    expect(
      await readCurrentClipboard({
        read: async () => [item({ "text/html": new Blob(["<b>html</b>"]) })],
      }),
    ).toEqual({ kind: "unsupported" });
  });
  it("권한 거부 후 다른 읽기 API로 재요청하지 않는다", async () => {
    const readText = vi.fn();
    const result = await readCurrentClipboard({
      read: async () => {
        throw new DOMException("denied", "NotAllowedError");
      },
      readText,
    });
    expect(result).toEqual({ kind: "denied" });
    expect(readText).not.toHaveBeenCalled();
  });
  it("미지원과 읽기 실패를 구분한다", async () => {
    expect(await readCurrentClipboard({})).toEqual({ kind: "unavailable" });
    expect(
      await readCurrentClipboard({
        read: async () => {
          throw new Error("failed");
        },
      }),
    ).toEqual({ kind: "failed" });
  });
});
