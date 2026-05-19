import { useMemo } from 'react';
import { getNestedValue } from './getNestedValue.js';
import { stringifyForSearch } from './useTableSearch.js';
import type { TableFilterModel } from '../../Table/table.types.js';

/**
 * Coerce a value to a number for range comparison. Returns
 * `null` if not coercible.
 */
function toNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Coerce a value to a Date's epoch ms for date-range comparison.
 * Accepts `Date` instances + ISO 8601 strings. Returns `null` if
 * not coercible.
 */
function toDateMs(value: unknown): number | null {
  if (value == null) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const d = new Date(value);
    const t = d.getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

/**
 * Test one row × one filter. Returns `true` if the row passes the
 * filter. The operator decides the predicate:
 *
 *  - `contains` → substring match on stringified value (text filter)
 *  - `equals` → strict equality (boolean filter mostly)
 *  - `between` → `value: [min, max]` tuple. Each end can be `null`
 *    for an open range. Used by number range + date range filters.
 *
 * Empty filter is a no-op (passes every row).
 */
function passesFilter(rowValue: unknown, op: string, filterValue: unknown): boolean {
  switch (op) {
    case 'contains': {
      const needle =
        typeof filterValue === 'string' ? filterValue.trim().toLowerCase() : '';
      if (!needle) return true;
      return stringifyForSearch(rowValue).toLowerCase().includes(needle);
    }
    case 'equals': {
      if (filterValue == null) return true;
      return rowValue === filterValue;
    }
    case 'between': {
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
      const [min, max] = filterValue as [unknown, unknown];
      if (min == null && max == null) return true;

      // Try number range first.
      const rowNum = toNumber(rowValue);
      const minNum = min == null ? null : toNumber(min);
      const maxNum = max == null ? null : toNumber(max);
      if (rowNum != null && (minNum != null || maxNum != null)) {
        if (minNum != null && rowNum < minNum) return false;
        if (maxNum != null && rowNum > maxNum) return false;
        return true;
      }

      // Fall through to date range.
      const rowMs = toDateMs(rowValue);
      const minMs = min == null ? null : toDateMs(min);
      const maxMs = max == null ? null : toDateMs(max);
      if (rowMs != null && (minMs != null || maxMs != null)) {
        if (minMs != null && rowMs < minMs) return false;
        if (maxMs != null && rowMs > maxMs) return false;
        return true;
      }

      // If neither coercion worked, let the row pass (defensive).
      return true;
    }
    default:
      return true;
  }
}

/**
 * Filters `rows` by the per-column filter model. AND semantics
 * across columns — a row must pass EVERY active filter.
 *
 * Each filter item specifies an `op` (`'contains'` / `'equals'` /
 * `'between'`) and a `value` whose shape matches the operator
 * (string for contains; primitive for equals; `[min, max]` tuple
 * for between).
 */
export function useTableFilter<T extends object>(
  rows: T[],
  filterModel: TableFilterModel,
): T[] {
  return useMemo(() => {
    if (!filterModel || filterModel.length === 0) return rows;
    return rows.filter((row) =>
      filterModel.every((filter) => {
        const value = getNestedValue(row, filter.field);
        return passesFilter(value, filter.op, filter.value);
      }),
    );
  }, [rows, filterModel]);
}

// Exposed for testing.
export { passesFilter, toNumber, toDateMs };
