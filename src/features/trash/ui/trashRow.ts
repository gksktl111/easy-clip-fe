export const formatDeletedAt = (deletedAt: string | null) => {
  if (!deletedAt) {
    return "-";
  }

  const date = new Date(deletedAt);
  return Number.isNaN(date.getTime()) ? deletedAt : date.toLocaleString();
};
