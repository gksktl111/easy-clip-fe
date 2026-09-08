export const MAX_CLIP_NAME_LENGTH = 15;

export const getClipNameLength = (value: string) =>
  Array.from(value.trim()).length;

export const isValidClipName = (value: string) => {
  const length = getClipNameLength(value);
  return length > 0 && length <= MAX_CLIP_NAME_LENGTH;
};
