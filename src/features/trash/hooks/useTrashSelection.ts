"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { useCallback, useMemo, useState } from "react";
import {
  getTrashRowKey,
  type TrashItemRow,
} from "@/features/trash/model/trashRow";
import {
  getSelectedTrashRows,
  mapTrashRowsToMutationItems,
  reconcileTrashRowSelection,
  toggleAllTrashRowSelection,
  toggleTrashRowSelection,
} from "@/features/trash/service/trashSelection";

// 휴지통 행 선택과 선택 항목의 bulk 요청 payload 생성을 관리합니다.
export const useTrashSelection = (rows: readonly TrashItemRow[]) => {
  const { scope } = useResourceAccess();
  const [selection, setSelection] = useState({
    scope,
    keys: new Set<string>(),
  });
  const storedSelectedRowKeys = useMemo(
    () => (selection.scope === scope ? selection.keys : new Set<string>()),
    [selection, scope],
  );
  const setStoredSelectedRowKeys = useCallback(
    (update: Set<string> | ((keys: Set<string>) => Set<string>)) => {
      setSelection((current) => ({
        scope,
        keys:
          typeof update === "function"
            ? update(current.scope === scope ? current.keys : new Set())
            : update,
      }));
    },
    [scope],
  );

  const selectedRows = useMemo(
    () => getSelectedTrashRows(rows, storedSelectedRowKeys),
    [rows, storedSelectedRowKeys],
  );
  const selectedRowKeys = useMemo(
    () => new Set(selectedRows.map(getTrashRowKey)),
    [selectedRows],
  );
  const selectedItems = useMemo(
    () => mapTrashRowsToMutationItems(selectedRows),
    [selectedRows],
  );
  const toggleRow = useCallback(
    (row: TrashItemRow) => {
      setStoredSelectedRowKeys((currentKeys) =>
        toggleTrashRowSelection(
          reconcileTrashRowSelection(currentKeys, rows),
          row,
        ),
      );
    },
    [rows, setStoredSelectedRowKeys],
  );
  const toggleAllRows = useCallback(() => {
    setStoredSelectedRowKeys((currentKeys) =>
      toggleAllTrashRowSelection(
        reconcileTrashRowSelection(currentKeys, rows),
        rows,
      ),
    );
  }, [rows, setStoredSelectedRowKeys]);
  const clearSelection = useCallback(
    () => setStoredSelectedRowKeys(new Set()),
    [setStoredSelectedRowKeys],
  );

  return {
    clearSelection,
    selectedItems,
    selectedRowKeys,
    selectedRows,
    toggleAllRows,
    toggleRow,
  };
};
