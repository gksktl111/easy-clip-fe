import { ALLOWED_IMAGE_CLIP_MIME_TYPES } from "./imageClipValidation";

export type ClipboardReadResult =
  | { kind: "text"; text: string }
  | { kind: "image"; file: File }
  | { kind: "empty" | "unsupported" | "unavailable" | "denied" | "failed" };

type ClipboardReader = Partial<Pick<Clipboard, "read" | "readText">>;

export async function readCurrentClipboard(
  clipboard: ClipboardReader | undefined = typeof navigator === "undefined"
    ? undefined
    : navigator.clipboard,
): Promise<ClipboardReadResult> {
  if (!clipboard) return { kind: "unavailable" };
  try {
    // 다른 비동기 작업보다 먼저 읽어 사용자 클릭 제스처를 유지합니다.
    if (typeof clipboard.read === "function") {
      const items = await clipboard.read();
      for (const item of items) {
        const mime = ALLOWED_IMAGE_CLIP_MIME_TYPES.find((type) =>
          item.types.includes(type),
        );
        if (!mime) continue;
        const blob = await item.getType(mime);
        return {
          kind: "image",
          file: new File([blob], `clipboard.${mime.split("/")[1]}`, {
            type: mime,
          }),
        };
      }
      const textItem = items.find((item) => item.types.includes("text/plain"));
      if (textItem) {
        const text = (
          await (await textItem.getType("text/plain")).text()
        ).trim();
        return text ? { kind: "text", text } : { kind: "empty" };
      }
      return { kind: items.length ? "unsupported" : "empty" };
    }
    if (typeof clipboard.readText === "function") {
      const text = (await clipboard.readText()).trim();
      return text ? { kind: "text", text } : { kind: "empty" };
    }
    return { kind: "unavailable" };
  } catch (error) {
    const isPermissionDenied =
      error instanceof Error &&
      ["NotAllowedError", "SecurityError"].includes(error.name);
    return { kind: isPermissionDenied ? "denied" : "failed" };
  }
}
