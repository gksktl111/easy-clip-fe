export const MAX_TAG_NAME_LENGTH = 10;

export type TagNameValidationError = "required" | "tooLong";

export const getTagNameLength = (name: string) => Array.from(name).length;

export const getTagNameValidationError = (
  name: string,
): TagNameValidationError | null => {
  if (!name.trim()) {
    return "required";
  }

  if (getTagNameLength(name) > MAX_TAG_NAME_LENGTH) {
    return "tooLong";
  }

  return null;
};

export const getUniqueTagNames = (names: readonly string[]) => [
  ...new Set(names),
];
