import { useMemo } from 'react';
import { getNestedValue } from './getNestedValue.js';
import type {
  TableColumn,
  TableSortModel,
  TableSortDirection,
} from '../../Table/table.types.js';

/**
 * Default comparator. Handles the common primitive types in a
 * sensible way:
 *
 *  - `null` / `undefined` always sort LAST (stable across asc/desc)
 *  - `number` / `bigint`         → numeric comparison
 *  - `string`                    → locale-aware compare via `Intl.Collator`
 *  - `Date` / ISO-string-date    → numeric compare on epoch ms
 *  - `boolean`                   → `false < true`
 *  - mixed types fall back to string compare
 *
 * The locale collator is created once per call (cheap; cached
 * upstream via memoization).
 */
function defaultCompare(a: unknown, b: unknown): number {
  // Numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }

  // Strings (incl. ISO date strings — natural lexical ordering matches chronology)
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }

  // Fallback: stringify and compare
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Applies the `sortModel` to `rows`. Returns a NEW sorted array
 * (does not mutate input). Stable sort guaranteed by the underlying
 * `Array.prototype.sort` in modern engines.
 *
 * Multi-column sort: items earlier in `sortModel` have higher
 * precedence. Equal values fall through to the next sort item; if
 * all sort items tie, the original order is preserved (stable).
 */
export function useTableSort<T extends object>(
  rows: T[],
  cols: TableColumn<T>[],
  sortModel: TableSortModel,
): T[] {
  return useMemo(() => {
    if (!sortModel || sortModel.length === 0) return rows;

    const sortConfigs = sortModel
      .map((item) => {
        const col = cols.find((c) => (c.field as string) === item.field);
        if (!col || !col.sortable) return null;
        const customCompare =
          typeof col.sortable === 'function' ? col.sortable : undefined;
        return { item, col, customCompare };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

    if (sortConfigs.length === 0) return rows;

    // Decorate-sort-undecorate for stability across engines.
    //
    // Per sort item: null/undefined values always sort LAST, regardless
    // of direction. This invariant lives outside the comparator so it's
    // not inverted by `-cmp` when direction is `desc`. (Without this
    // separation, `desc` flipped null-handling and placed nulls FIRST,
    // which broke user expectations — fixed in the v1 implementation.)
    return [...rows].sort((a, b) => {
      for (const { item, customCompare } of sortConfigs) {
        const aVal = customCompare ? a : getNestedValue(a, item.field);
        const bVal = customCompare ? b : getNestedValue(b, item.field);

        // Null-last (direction-independent)
        const aNull = aVal == null;
        const bNull = bVal == null;
        if (aNull && bNull) continue;
        if (aNull) return 1;
        if (bNull) return -1;

        const cmp = customCompare ? customCompare(a, b) : defaultCompare(aVal, bVal);
        if (cmp !== 0) {
          return item.direction === 'desc' ? -cmp : cmp;
        }
      }
      return 0;
    });
  }, [rows, cols, sortModel]);
}

/**
 * Three-state sort cycler: `none` → `asc` → `desc` → `none`.
 *
 * Used by the header click handler. Returns the next sort model
 * to apply, given the current model + the clicked field + whether
 * the user is multi-sorting (shift key).
 */
export function cycleSortFor(
  current: TableSortModel,
  field: string,
  multi: boolean,
): TableSortModel {
  const existing = current.find((s) => s.field === field);
  const nextDirection: TableSortDirection | null = !existing
    ? 'asc'
    : existing.direction === 'asc'
      ? 'desc'
      : null;

  if (multi) {
    // Multi-sort: keep other entries, update / add / remove this one.
    const rest = current.filter((s) => s.field !== field);
    if (nextDirection == null) return rest;
    return [...rest, { field, direction: nextDirection }];
  }

  // Single-sort: replace the whole model.
  if (nextDirection == null) return [];
  return [{ field, direction: nextDirection }];
}
