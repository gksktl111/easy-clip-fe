import {
  getTrashRowKey,
  type TrashItemRow,
} from "@/features/trash/model/trashRow";
import type { TrashItemMutationDto } from "@/features/trash/model/trash.dto";

export const getSelectedTrashRows = (
  rows: readonly TrashItemRow[],
  selectedRowKeys: ReadonlySet<string>,
) => rows.filter((row) => selectedRowKeys.has(getTrashRowKey(row)));

export const toggleTrashRowSelection = (
  selectedRowKeys: ReadonlySet<string>,
  row: TrashItemRow,
) => {
  const nextKeys = new Set(selectedRowKeys);
  const key = getTrashRowKey(row);

  if (nextKeys.has(key)) {
    nextKeys.delete(key);
  } else {
    nextKeys.add(key);
  }

  return nextKeys;
};

export const toggleAllTrashRowSelection = (
  selectedRowKeys: ReadonlySet<string>,
  rows: readonly TrashItemRow[],
) => {
  const areAllRowsSelected =
    rows.length > 0 &&
    rows.every((row) => selectedRowKeys.has(getTrashRowKey(row)));

  return areAllRowsSelected
    ? new Set<string>()
    : new Set(rows.map(getTrashRowKey));
};

export const reconcileTrashRowSelection = (
  selectedRowKeys: Set<string>,
  rows: readonly TrashItemRow[],
) => {
  const availableRowKeys = new Set(rows.map(getTrashRowKey));
  const nextKeys = new Set(
    [...selectedRowKeys].filter((key) => availableRowKeys.has(key)),
  );

  return nextKeys.size === selectedRowKeys.size ? selectedRowKeys : nextKeys;
};

export const mapTrashRowsToMutationItems = (
  rows: readonly TrashItemRow[],
): TrashItemMutationDto[] =>
  rows.map((row) => ({
    itemType: row.kind === "clip" ? "CLIP" : "FOLDER",
    id: row.id,
  }));
