"use client";

import { Clip } from "@/features/clip/model/clip";

const IMAGE_CLIPBOARD_FALLBACK_TYPE = "image/png";

export class ClipClipboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClipClipboardError";
  }
}

const assertClipboardApi = () => {
  if (!navigator.clipboard) {
    throw new ClipClipboardError("Clipboard API is not available.");
  }
};

const writeTextToClipboard = async (text: string) => {
  assertClipboardApi();
  await navigator.clipboard.writeText(text);
};

const fetchImageBlob = async (imageUrl: string) => {
  const response = await fetch(imageUrl, {
    mode: "cors",
  });

  if (!response.ok) {
    throw new ClipClipboardError("Failed to fetch image clip.");
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new ClipClipboardError("Fetched clip is not an image.");
  }

  return blob;
};

const convertImageBlobToPng = async (blob: Blob) => {
  const imageBitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const context = canvas.getContext("2d");

  if (!context) {
    imageBitmap.close();
    throw new ClipClipboardError("Canvas is not available.");
  }

  context.drawImage(imageBitmap, 0, 0);
  imageBitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        reject(new ClipClipboardError("Failed to convert image clip."));
        return;
      }

      resolve(pngBlob);
    }, IMAGE_CLIPBOARD_FALLBACK_TYPE);
  });
};

const writeImageBlobToClipboard = async (blob: Blob) => {
  assertClipboardApi();

  if (!navigator.clipboard.write || typeof ClipboardItem === "undefined") {
    throw new ClipClipboardError("Image clipboard API is not available.");
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return;
  } catch (error) {
    if (blob.type === IMAGE_CLIPBOARD_FALLBACK_TYPE) {
      throw error;
    }
  }

  const pngBlob = await convertImageBlobToPng(blob);

  await navigator.clipboard.write([
    new ClipboardItem({
      [IMAGE_CLIPBOARD_FALLBACK_TYPE]: pngBlob,
    }),
  ]);
};

const copyImageClipToClipboard = async (imageUrl: string) => {
  const imageBlob = await fetchImageBlob(imageUrl);
  await writeImageBlobToClipboard(imageBlob);
};

export const copyClipToClipboard = async (clip: Clip) => {
  if (clip.type === "image") {
    await copyImageClipToClipboard(clip.content);
    return;
  }

  await writeTextToClipboard(clip.content);
};
