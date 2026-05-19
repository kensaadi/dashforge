import { useCallback, useMemo } from 'react';
import type { TableRowSelectionMode } from '../../Table/table.types.js';

export interface UseTableSelectionResult {
  selectedRowIds: string[];
  isSelected: (rowId: string) => boolean;
  toggleRow: (rowId: string) => void;
  toggleAll: (allRowIds: string[]) => void;
  clearSelection: () => void;
  /** True when EVERY id in `allRowIds` is selected. */
  isAllSelected: (allRowIds: string[]) => boolean;
  /** True when at least one (but not all) of `allRowIds` is selected. */
  isIndeterminate: (allRowIds: string[]) => boolean;
}

/**
 * Selection logic helper. Given the controllable selection state +
 * the setter (from `useControllableState`), exposes ergonomic
 * helpers the Table calls from its render path.
 *
 *  - `single` mode: at most one row selected. Toggling another
 *    replaces the previous.
 *  - `multiple` mode: any subset selectable; toggling adds/removes.
 *  - `none` mode: every toggle is a no-op (the Table shouldn't
 *    render the checkbox cells anyway, but this is defensive).
 */
export function useTableSelection(
  mode: TableRowSelectionMode,
  selectedRowIds: string[],
  setSelectedRowIds: (next: string[] | ((prev: string[]) => string[])) => void,
): UseTableSelectionResult {
  const selectedSet = useMemo(
    () => new Set(selectedRowIds),
    [selectedRowIds],
  );

  const isSelected = useCallback(
    (rowId: string) => selectedSet.has(rowId),
    [selectedSet],
  );

  const toggleRow = useCallback(
    (rowId: string) => {
      if (mode === 'none') return;
      if (mode === 'single') {
        setSelectedRowIds(selectedSet.has(rowId) ? [] : [rowId]);
        return;
      }
      // multiple
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        if (next.has(rowId)) next.delete(rowId);
        else next.add(rowId);
        return [...next];
      });
    },
    [mode, selectedSet, setSelectedRowIds],
  );

  const toggleAll = useCallback(
    (allRowIds: string[]) => {
      if (mode !== 'multiple') return;
      const allSelected = allRowIds.every((id) => selectedSet.has(id));
      setSelectedRowIds(allSelected ? [] : [...allRowIds]);
    },
    [mode, selectedSet, setSelectedRowIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedRowIds([]);
  }, [setSelectedRowIds]);

  const isAllSelected = useCallback(
    (allRowIds: string[]) => {
      if (allRowIds.length === 0) return false;
      return allRowIds.every((id) => selectedSet.has(id));
    },
    [selectedSet],
  );

  const isIndeterminate = useCallback(
    (allRowIds: string[]) => {
      if (allRowIds.length === 0) return false;
      const some = allRowIds.some((id) => selectedSet.has(id));
      const all = allRowIds.every((id) => selectedSet.has(id));
      return some && !all;
    },
    [selectedSet],
  );

  return {
    selectedRowIds,
    isSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
  };
}
